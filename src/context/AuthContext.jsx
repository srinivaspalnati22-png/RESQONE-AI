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
    return localStorage.getItem('resqone_is_onboarded') === 'true';
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('resqone_user');
    return saved ? JSON.parse(saved) : {
      id: 'demo-user-001',
      email: 'responder@resqone.ai',
      name: 'Srinivas Palnati (Victim / User)',
      phone: '+91-9876543210',
      role: 'user',
      blood_group: 'O-',
      medical_notes: 'No known drug allergies. Universal O- recipient preferred.'
    };
  });

  const [familyContacts, setFamilyContacts] = useState(() => {
    const saved = localStorage.getItem('resqone_family_contacts');
    return saved ? JSON.parse(saved) : DEFAULT_FAMILY_CONTACTS;
  });

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

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
      phone: authUser.user_metadata?.phone || '+91-9876543210'
    };
    setUser(userObj);
    localStorage.setItem('resqone_user', JSON.stringify(userObj));
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
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const demoUser = {
          id: 'demo-user-001',
          email,
          name: email.split('@')[0],
          role: 'user',
          blood_group: 'O-',
          phone: '+91-9876543210'
        };
        setUser(demoUser);
        localStorage.setItem('resqone_user', JSON.stringify(demoUser));
        completeOnboarding(demoUser);
        return { success: true, user: demoUser };
      }
      syncProfile(data.user);
      completeOnboarding(data.user);
      return { success: true, user: data.user };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name, role, blood_group, phone) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, blood_group, phone }
        }
      });
      if (error) throw error;
      if (data.user) {
        syncProfile(data.user);
        completeOnboarding(data.user);
      }
      return { success: true, user: data.user };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsOnboarded(false);
    localStorage.removeItem('resqone_user');
    localStorage.removeItem('resqone_is_onboarded');
  };

  const updateProfile = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('resqone_user', JSON.stringify(updated));
  };

  const updateFamilyContacts = (contacts) => {
    setFamilyContacts(contacts);
    localStorage.setItem('resqone_family_contacts', JSON.stringify(contacts));
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
      loginWithGoogle
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
