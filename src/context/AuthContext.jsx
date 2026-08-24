import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uguzspnutzjntqxixyiu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9AX3c8QaOfM7h-akKbw2MQ_FF0f5h7v";

const DEFAULT_FAMILY_CONTACTS = [
  { id: 'fc-1', name: 'Father (Primary SOS)', relation: 'Father', phone: '+91-9440123456', notifyOnCrash: true },
  { id: 'fc-2', name: 'Mother (Emergency)', relation: 'Mother', phone: '+91-9440123457', notifyOnCrash: true },
  { id: 'fc-3', name: 'Brother / Sister', relation: 'Sibling', phone: '+91-9440123458', notifyOnCrash: true },
  { id: 'fc-4', name: 'Best Friend / Colleague', relation: 'Friend', phone: '+91-9440123459', notifyOnCrash: true },
  { id: 'fc-5', name: 'Family Physician / Doctor', relation: 'Doctor', phone: '+91-9440123460', notifyOnCrash: true },
];

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isOnboarded, setIsOnboarded] = useState(() => {
    try {
      return localStorage.getItem('resqone_is_onboarded') === 'true';
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('resqone_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [familyContacts, setFamilyContacts] = useState(() => {
    try {
      const saved = localStorage.getItem('resqone_family_contacts');
      return saved ? JSON.parse(saved) : DEFAULT_FAMILY_CONTACTS;
    } catch {
      return DEFAULT_FAMILY_CONTACTS;
    }
  });

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        syncProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        syncProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncProfile = (authUser) => {
    const userObj = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      role: authUser.user_metadata?.role || 'user',
      blood_group: authUser.user_metadata?.blood_group || 'O-',
      phone: authUser.user_metadata?.phone || '+91-9876543210',
      medical_notes: authUser.user_metadata?.medical_notes || ''
    };
    setUser(userObj);
    localStorage.setItem('resqone_user', JSON.stringify(userObj));
  };

  // Save user profile + family contacts to Supabase 'users' table
  const saveUserToSupabase = async (profileData, contacts) => {
    try {
      const payload = {
        id: profileData.id || session?.user?.id || `local-${Date.now()}`,
        email: profileData.email,
        name: profileData.name,
        phone: profileData.phone,
        blood_group: profileData.blood_group,
        role: profileData.role || 'user',
        medical_notes: profileData.medical_notes || '',
        family_contacts: JSON.stringify(contacts || familyContacts),
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'email' });

      if (error) {
        console.warn('Supabase users table upsert notice:', error.message);
        // Silently fail — data is stored in localStorage as fallback
      }
    } catch (err) {
      console.warn('Supabase save notice:', err);
    }
  };

  const completeOnboarding = (customUser = null, contacts = null) => {
    if (customUser) {
      setUser(customUser);
      localStorage.setItem('resqone_user', JSON.stringify(customUser));
    }
    if (contacts) {
      setFamilyContacts(contacts);
      localStorage.setItem('resqone_family_contacts', JSON.stringify(contacts));
    }
    setIsOnboarded(true);
    localStorage.setItem('resqone_is_onboarded', 'true');
    setAuthError(null);

    // Persist to Supabase in background
    if (customUser) {
      saveUserToSupabase(customUser, contacts);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Fallback: allow local-only login for demo/offline mode
        const demoUser = {
          id: `demo-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: 'user',
          blood_group: 'O-',
          phone: '+91-9876543210'
        };
        setUser(demoUser);
        localStorage.setItem('resqone_user', JSON.stringify(demoUser));
        completeOnboarding(demoUser);
        return { success: true, user: demoUser, isDemo: true };
      }
      syncProfile(data.user);
      completeOnboarding();
      return { success: true, user: data.user };
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name, role, blood_group, phone, medical_notes) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, blood_group, phone, medical_notes }
        }
      });
      if (error) {
        // If Supabase auth fails, still allow local registration for demo
        const localUser = {
          id: `local-${Date.now()}`,
          email,
          name,
          role: role || 'user',
          blood_group: blood_group || 'O-',
          phone: phone || '',
          medical_notes: medical_notes || ''
        };
        setUser(localUser);
        localStorage.setItem('resqone_user', JSON.stringify(localUser));
        completeOnboarding(localUser);
        saveUserToSupabase(localUser, familyContacts);
        return { success: true, user: localUser, isLocal: true };
      }
      if (data.user) {
        const userObj = {
          id: data.user.id,
          email: data.user.email,
          name,
          role: role || 'user',
          blood_group: blood_group || 'O-',
          phone: phone || '',
          medical_notes: medical_notes || ''
        };
        setUser(userObj);
        localStorage.setItem('resqone_user', JSON.stringify(userObj));
        completeOnboarding(userObj);
      }
      return { success: true, user: data.user };
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsOnboarded(false);
    setAuthError(null);
    localStorage.removeItem('resqone_user');
    localStorage.removeItem('resqone_is_onboarded');
    localStorage.removeItem('resqone_family_contacts');
  };

  const updateProfile = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('resqone_user', JSON.stringify(updated));
    saveUserToSupabase(updated, familyContacts);
  };

  const updateFamilyContacts = (contacts) => {
    setFamilyContacts(contacts);
    localStorage.setItem('resqone_family_contacts', JSON.stringify(contacts));
    if (user) saveUserToSupabase(user, contacts);
  };

  const updateUserRole = (role) => {
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem('resqone_user', JSON.stringify(updated));
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) console.error("Google Auth error:", error);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isOnboarded,
      completeOnboarding,
      familyContacts,
      updateFamilyContacts,
      updateProfile,
      login,
      signup,
      logout,
      updateUserRole,
      loginWithGoogle,
      authError,
      setAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
