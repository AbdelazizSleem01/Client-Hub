'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  isOwner: boolean;
}

export type RememberDuration = 'session' | 'week' | 'month';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (password: string, email?: string, rememberDuration?: RememberDuration) => Promise<{ success: boolean; error?: string }>;
  signUp: (password: string, email?: string, rememberDuration?: RememberDuration) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'usr-owner-001',
  email: 'owner@workspace.dev',
  name: 'Studio Owner',
  isOwner: true,
};

const SESSION_KEY = 'client_dashboard_session';
const EXPIRY_KEY = 'client_dashboard_session_expiry';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<UserProfile | null>(configured ? null : DEMO_USER);
  const [isLoading, setIsLoading] = useState(configured);
  const [isDemo, setIsDemo] = useState(!configured);

  useEffect(() => {
    const checkAuth = async () => {
      const supabaseConfigured = isSupabaseConfigured();
      setIsDemo(!supabaseConfigured);

      // Check session expiration if set
      if (typeof window !== 'undefined') {
        const expiryStr = localStorage.getItem(EXPIRY_KEY);
        if (expiryStr) {
          const expiryTime = parseInt(expiryStr, 10);
          if (!isNaN(expiryTime) && Date.now() > expiryTime) {
            // Session expired!
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(EXPIRY_KEY);
            setUser(null);
            setIsLoading(false);
            return;
          }
        }
      }

      if (supabaseConfigured) {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || 'owner@workspace.dev',
              name: session.user.user_metadata?.name || 'Workspace Owner',
              isOwner: true,
            });
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        // Demo Mode: check localStorage for persisted owner session
        if (typeof window !== 'undefined') {
          const savedSession = localStorage.getItem(SESSION_KEY);
          if (savedSession) {
            try {
              setUser(JSON.parse(savedSession));
            } catch {
              setUser(DEMO_USER);
            }
          } else {
            setUser(DEMO_USER);
            localStorage.setItem(SESSION_KEY, JSON.stringify(DEMO_USER));
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const saveSessionDuration = (duration: RememberDuration) => {
    if (typeof window === 'undefined') return;
    if (duration === 'week') {
      const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(EXPIRY_KEY, expiry.toString());
    } else if (duration === 'month') {
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem(EXPIRY_KEY, expiry.toString());
    } else {
      localStorage.removeItem(EXPIRY_KEY);
    }
  };

  const login = async (
    password: string,
    email: string = 'owner@workspace.dev',
    rememberDuration: RememberDuration = 'month'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    if (!isDemo && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || 'Workspace Owner',
            isOwner: true,
          };
          setUser(profile);
          saveSessionDuration(rememberDuration);
          setIsLoading(false);
          return { success: true };
        }
        setIsLoading(false);
        return { success: false, error: 'Login failed' };
      } catch (err: unknown) {
        setIsLoading(false);
        const message = err instanceof Error ? err.message : 'Authentication failed';
        return { success: false, error: message };
      }
    } else {
      // Demo Mode verification
      const savedPass = typeof window !== 'undefined' ? localStorage.getItem('client_dashboard_demo_password') || 'password' : 'password';
      if (password === savedPass || password === 'admin' || password === 'password' || password.length >= 4) {
        setUser(DEMO_USER);
        if (typeof window !== 'undefined') {
          localStorage.setItem(SESSION_KEY, JSON.stringify(DEMO_USER));
          saveSessionDuration(rememberDuration);
        }
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Incorrect password. (Demo password is "password")' };
      }
    }
  };

  const signUp = async (
    password: string,
    email: string = 'owner@workspace.dev',
    rememberDuration: RememberDuration = 'month'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    if (!isDemo && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: 'Workspace Owner' },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          // If session returned immediately (email confirmation disabled or auto confirmed)
          if (data.session) {
            const profile: UserProfile = {
              id: data.user.id,
              email: data.user.email || email,
              name: 'Workspace Owner',
              isOwner: true,
            };
            setUser(profile);
            saveSessionDuration(rememberDuration);
          }
          setIsLoading(false);
          return { success: true };
        }
        setIsLoading(false);
        return { success: true };
      } catch (err: unknown) {
        setIsLoading(false);
        const message = err instanceof Error ? err.message : 'Registration failed';
        return { success: false, error: message };
      }
    } else {
      // Demo mode password initialization
      if (typeof window !== 'undefined') {
        localStorage.setItem('client_dashboard_demo_password', password);
        localStorage.setItem(SESSION_KEY, JSON.stringify(DEMO_USER));
        saveSessionDuration(rememberDuration);
      }
      setUser(DEMO_USER);
      setIsLoading(false);
      return { success: true };
    }
  };

  const logout = async () => {
    if (!isDemo && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(EXPIRY_KEY);
    }
    setUser(null);
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    if (!isDemo && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update password';
        return { success: false, error: message };
      }
    } else {
      // Demo Mode update
      if (typeof window !== 'undefined') {
        localStorage.setItem('client_dashboard_demo_password', newPassword);
      }
      return { success: true };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemoMode: isDemo,
        login,
        signUp,
        logout,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
