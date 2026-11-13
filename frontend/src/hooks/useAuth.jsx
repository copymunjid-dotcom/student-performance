import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session in localStorage
    const savedUser = localStorage.getItem('sppd_user');
    const savedToken = localStorage.getItem('sppd_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('sppd_user');
      }
    } else {
      // Set default demo user for frictionless immediate exploration
      const demoUser = {
        id: 'usr-admin-1',
        email: 'admin@university.edu',
        full_name: 'Dr. Sarah Mitchell',
        role: 'admin',
        department: 'Computer Science'
      };
      setUser(demoUser);
      localStorage.setItem('sppd_user', JSON.stringify(demoUser));
      localStorage.setItem('sppd_token', 'demo-token-active');
    }

    // If Supabase is configured, check Supabase session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            role: session.user.user_metadata?.role || 'teacher',
            department: session.user.user_metadata?.department || 'Computer Science'
          };
          setUser(u);
          localStorage.setItem('sppd_user', JSON.stringify(u));
          localStorage.setItem('sppd_token', session.access_token);
        }
      });
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const u = {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          role: data.user.user_metadata?.role || 'teacher',
          department: data.user.user_metadata?.department || 'Computer Science'
        };
        setUser(u);
        localStorage.setItem('sppd_user', JSON.stringify(u));
        localStorage.setItem('sppd_token', data.session.access_token);
        return { success: true, user: u };
      }

      // Backend API login
      const res = await api.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('sppd_user', JSON.stringify(res.user));
        localStorage.setItem('sppd_token', res.token);
        return { success: true, user: res.user };
      }
      throw new Error(res.error || 'Login failed');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              full_name: userData.full_name,
              role: userData.role || 'teacher',
              department: userData.department || 'Computer Science'
            }
          }
        });
        if (error) throw error;
      }

      const res = await api.register(userData);
      return res;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('sppd_user');
    localStorage.removeItem('sppd_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
