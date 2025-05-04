
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { app } from '@/lib/firebase-config';
import type { Locale } from '@/i18n'; // Import Locale type

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultAuthContextValue: AuthContextType = {
  user: null,
  loading: true,
  login: async () => { throw new Error('Login function not implemented'); },
  logout: async () => { throw new Error('Logout function not implemented'); },
};


export const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

interface AuthProviderProps {
  children: ReactNode;
}

// Helper to extract locale from pathname
const getLocaleFromPathname = (pathname: string): Locale | null => {
  const segments = pathname.split('/');
  if (segments.length > 1 && ['en', 'ru', 'uz'].includes(segments[1])) {
    return segments[1] as Locale;
  }
  return null; // Or return defaultLocale if preferred
};


export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle user state update and redirect effect
    } catch (error) {
      console.error("Login Error:", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    const currentLocale = getLocaleFromPathname(pathname) || 'en'; // Get locale or default
    try {
        await signOut(auth);
        // Redirect to localized login page
        router.push(`/${currentLocale}/login`);
    } catch (error) {
        console.error("Logout Error:", error);
        setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

