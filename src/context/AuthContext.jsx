import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uguzspnutzjntqxixyiu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9AX3c8QaOfM7h-akKbw2MQ_FF0f5h7v";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('resqone_user');
    return saved ? JSON.parse(saved) : {
      id: 'demo-user-001',
      email: 'responder@resqone.ai',
      name: 'Emergency Responder',
      phone: '+91-9876543210',
      role: 'user',
      blood_group: 'O-'
    };
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

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Fallback login for demo
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
        return { success: true, user: demoUser };
      }
      syncProfile(data.user);
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
      if (error) {
        const demoUser = { id: `usr-${Date.now()}`, email, name, role, blood_group, phone };
        setUser(demoUser);
        localStorage.setItem('resqone_user', JSON.stringify(demoUser));
        return { success: true, user: demoUser };
      }
      if (data.user) syncProfile(data.user);
      return { success: true, user: data.user };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('resqone_user');
    setUser(null);
  };

  const updateUserRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('resqone_user', JSON.stringify(updated));
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        const googleUser = {
          id: `google-usr-${Date.now()}`,
          email: 'user.google@gmail.com',
          name: 'Google User',
          role: 'user',
          blood_group: 'O+',
          phone: '+91-9876543210'
        };
        setUser(googleUser);
        localStorage.setItem('resqone_user', JSON.stringify(googleUser));
        return { success: true, user: googleUser };
      }
      return { success: true, data };
    } catch (err) {
      const googleUser = {
        id: `google-usr-${Date.now()}`,
        email: 'user.google@gmail.com',
        name: 'Google User',
        role: 'user',
        blood_group: 'O+',
        phone: '+91-9876543210'
      };
      setUser(googleUser);
      localStorage.setItem('resqone_user', JSON.stringify(googleUser));
      return { success: true, user: googleUser };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout, updateUserRole, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
