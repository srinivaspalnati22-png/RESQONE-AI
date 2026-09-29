import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { registerDeviceForBackgroundPush } from '../services/push_subscription_service.js';

export { supabase };

const DEFAULT_FAMILY_CONTACTS = [
  { id: 'fc-1', name: 'Father (Primary SOS)', relation: 'Father', phone: '+91-9440123456', notifyOnCrash: true },
  { id: 'fc-2', name: 'Mother (Emergency)', relation: 'Mother', phone: '+91-9440123457', notifyOnCrash: true },
  { id: 'fc-3', name: 'Brother / Sister', relation: 'Sibling', phone: '+91-9440123458', notifyOnCrash: true },
  { id: 'fc-4', name: 'Best Friend / Colleague', relation: 'Friend', phone: '+91-9440123459', notifyOnCrash: true },
  { id: 'fc-5', name: 'Family Physician / Doctor', relation: 'Doctor', phone: '+91-9440123460', notifyOnCrash: true },
];




export const checkIsDemoLogin = (user) => {
  try {
    if (localStorage.getItem('resqone_is_demo_login') === 'false') return false;
    if (sessionStorage.getItem('resqone_is_demo_login') === 'false') return false;
    if (user?.is_demo_mode === false) return false;
    if (user?.auth_provider === 'google' || user?.auth_provider === 'email' || user?.auth_provider === 'local') return false;
    if (user?.email && user.email !== 'srinivas@resqone.ai' && user.email !== 'demo@resqone.ai') return false;
    if (user?.id && !String(user.id).startsWith('demo-')) return false;

    return Boolean(
      user?.is_demo_mode === true ||
      user?.auth_provider === 'demo' ||
      localStorage.getItem('resqone_is_demo_login') === 'true'
    );
  } catch (e) {
    return false;
  }
};

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
    // Check initial session & handle OAuth redirects
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        syncProfile(session.user);
        if (window.location.hash && window.location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        syncProfile(session.user);
        if (window.location.hash && window.location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncProfile = async (authUser) => {
    let existingUser = null;
    try {
      const saved = localStorage.getItem('resqone_user');
      if (saved) existingUser = JSON.parse(saved);
    } catch {}

    // Fetch live profile record from Supabase 'profiles' table
    let dbProfile = null;
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        if (!error && data) {
          dbProfile = data;
        }
      }
    } catch (e) {
      console.warn('Supabase profile query notice:', e);
    }

    const hasContactsConfigured = Boolean(
      existingUser?.hasSetupEmergencyContacts || 
      authUser.user_metadata?.has_setup_contacts ||
      (dbProfile?.family_contacts && (Array.isArray(dbProfile.family_contacts) ? dbProfile.family_contacts.length > 0 : true))
    );

    const resolvedName = dbProfile?.name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || existingUser?.name || authUser.email?.split('@')[0] || 'User';
    const resolvedPhone = dbProfile?.phone || authUser.user_metadata?.phone || authUser.phone || existingUser?.phone || '+91-9876543210';
    const resolvedBlood = dbProfile?.blood_group || authUser.user_metadata?.blood_group || existingUser?.blood_group || 'O-';
    const resolvedRole = dbProfile?.role || authUser.user_metadata?.role || existingUser?.role || 'user';
    const resolvedNotes = dbProfile?.medical_notes || authUser.user_metadata?.medical_notes || existingUser?.medical_notes || '';
    const resolvedAvatar = dbProfile?.avatar_url || authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || existingUser?.avatar_url || null;

    if (dbProfile?.family_contacts) {
      try {
        const parsed = typeof dbProfile.family_contacts === 'string' ? JSON.parse(dbProfile.family_contacts) : dbProfile.family_contacts;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFamilyContacts(parsed);
          localStorage.setItem('resqone_family_contacts', JSON.stringify(parsed));
        }
      } catch {}
    }

    const userObj = {
      id: authUser.id,
      email: authUser.email,
      name: resolvedName,
      role: resolvedRole,
      blood_group: resolvedBlood,
      phone: resolvedPhone,
      medical_notes: resolvedNotes,
      avatar_url: resolvedAvatar,
      auth_provider: authUser.app_metadata?.provider || 'google',
      is_demo_mode: false,
      hasSetupEmergencyContacts: hasContactsConfigured
    };
    setUser(userObj);
    localStorage.setItem('resqone_user', JSON.stringify(userObj));
    localStorage.setItem('resqone_is_demo_login', 'false');
    sessionStorage.setItem('resqone_is_demo_login', 'false');
    localStorage.setItem('resqone_user_id', userObj.id);
    localStorage.setItem('resqone_user_name', userObj.name);
    localStorage.setItem('resqone_user_phone', userObj.phone);
    localStorage.setItem('resqone_user_blood', userObj.blood_group);
    localStorage.setItem('resqone_user_email', userObj.email || '');
    setIsOnboarded(true);
    localStorage.setItem('resqone_is_onboarded', 'true');

    // Register push subscription with real user name & ID
    registerDeviceForBackgroundPush(userObj);

    // Save/Sync back to Supabase 'profiles' table to ensure record exists
    saveUserToSupabase(userObj);
  };

  // Save user profile + family contacts to Supabase 'profiles' table
  const saveUserToSupabase = async (profileData, contacts) => {
    try {
      if (!supabase) return;
      const contactsToSave = contacts || familyContacts;
      const payload = {
        id: profileData.id || session?.user?.id || `local-${Date.now()}`,
        email: profileData.email,
        name: profileData.name,
        phone: profileData.phone,
        blood_group: profileData.blood_group,
        role: profileData.role || 'user',
        medical_notes: profileData.medical_notes || '',
        avatar_url: profileData.avatar_url || null,
        family_contacts: contactsToSave,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 1. Primary: Save to Supabase 'profiles' table
      const { error: profError } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (profError) {
        console.warn('Supabase profiles table upsert notice:', profError.message);
        // Fallback: try legacy 'users' table
        await supabase
          .from('users')
          .upsert({
            ...payload,
            family_contacts: JSON.stringify(contactsToSave)
          }, { onConflict: 'email' })
          .catch(() => {});
      }

      // 2. Automatically log profile details to 'activity_log' table
      await supabase
        .from('activity_log')
        .insert([{
          id: `act-login-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          event_type: 'USER_LOGIN',
          description: `Profile login: ${profileData.name || 'Citizen'} (${profileData.email || 'N/A'}) - Role: ${(profileData.role || 'user').toUpperCase()} | Blood: ${profileData.blood_group || 'O-'}`,
          severity: 'INFO',
          created_at: new Date().toISOString()
        }])
        .catch(() => {});
    } catch (err) {
      console.warn('Supabase save notice:', err);
    }
  };


  const completeOnboarding = (customUser = null, contacts = null) => {
    if (customUser) {
      setUser(customUser);
      localStorage.setItem('resqone_user', JSON.stringify(customUser));
      if (customUser.name) localStorage.setItem('resqone_user_name', customUser.name);
      if (customUser.phone) localStorage.setItem('resqone_user_phone', customUser.phone);
      if (customUser.blood_group) localStorage.setItem('resqone_user_blood', customUser.blood_group);
      if (customUser.email) localStorage.setItem('resqone_user_email', customUser.email);
      if (customUser.id) localStorage.setItem('resqone_user_id', customUser.id);
      registerDeviceForBackgroundPush(customUser);
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
    localStorage.setItem('resqone_is_demo_login', 'false');
    sessionStorage.setItem('resqone_is_demo_login', 'false');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      if (data?.user) {
        await syncProfile(data.user);
        completeOnboarding();
        return { success: true, user: data.user };
      }
      return { success: false, error: 'No user session returned' };
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
    localStorage.setItem('resqone_is_demo_login', 'false');
    sessionStorage.setItem('resqone_is_demo_login', 'false');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, blood_group, phone, medical_notes }
        }
      });
      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      if (data?.user) {
        const userObj = {
          id: data.user.id,
          email: data.user.email,
          name,
          role: role || 'user',
          blood_group: blood_group || 'O-',
          phone: phone || '',
          medical_notes: medical_notes || '',
          auth_provider: 'email',
          is_demo_mode: false
        };
        setUser(userObj);
        localStorage.setItem('resqone_user', JSON.stringify(userObj));
        completeOnboarding(userObj);
        await saveUserToSupabase(userObj, familyContacts);
        return { success: true, user: data.user };
      }
      return { success: false, error: 'Registration incomplete' };
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };


  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out notice:", e);
    }
    setUser(null);
    setSession(null);
    setIsOnboarded(false);
    setAuthError(null);
    localStorage.removeItem('resqone_user');
    localStorage.removeItem('resqone_is_onboarded');
    localStorage.removeItem('resqone_family_contacts');
    localStorage.removeItem('resqone_is_demo_login');
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

  // Google OAuth with explicit production redirectTo
  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    localStorage.setItem('resqone_is_demo_login', 'false');
    sessionStorage.setItem('resqone_is_demo_login', 'false');
    try {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const redirectUrl = isLocal ? window.location.origin : 'https://resqone-ai-app.vercel.app';

      const { data, error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });
      
      if (error) {
        console.error("Supabase Google OAuth Notice:", error.message);
        setAuthError(`Google Sign-In Notice: ${error.message}`);
        return { success: false, error: error.message };
      }

      if (data?.url) {
        window.location.href = data.url;
        return { success: true, redirecting: true };
      }
      return { success: true, data };
    } catch (err) {
      console.error("Google Auth catch notice:", err);
      setAuthError(err.message || 'Failed to initiate Google Sign-In');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
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
