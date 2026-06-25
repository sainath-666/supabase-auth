'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { apiRequest } from './api';

export interface UserPermissions {
  employee: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    list: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  permissions: UserPermissions | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  jwtDecoded: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [jwtDecoded, setJwtDecoded] = useState<any | null>(null);

  const fetchPermissions = async () => {
    try {
      const data = await apiRequest('/me/permissions');
      setPermissions(data);
    } catch (err) {
      console.error('Failed to fetch permissions', err);
      setPermissions(null);
    }
  };

  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      setJwtDecoded(JSON.parse(jsonPayload));
    } catch {
      setJwtDecoded(null);
    }
  };

  useEffect(() => {
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        decodeJwt(session.access_token);
        fetchPermissions();
      } else {
        setLoading(false);
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        decodeJwt(session.access_token);
        await fetchPermissions();
      } else {
        setUser(null);
        setPermissions(null);
        setJwtDecoded(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPermissions(null);
    setJwtDecoded(null);
  };

  const role = user?.user_metadata?.role || 'Viewer';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        loading,
        logout,
        refreshPermissions: fetchPermissions,
        jwtDecoded,
      }}
    >
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
