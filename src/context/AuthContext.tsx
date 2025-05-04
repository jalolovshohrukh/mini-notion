
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { app } from '@/lib/firebase-config'; // Import your Firebase app instance

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Explicitly provide a default value that matches the type structure
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User state will update via onAuthStateChanged
    } catch (error) {
      console.error("Login Error:", error);
      setLoading(false); // Ensure loading is set to false on error
      throw error; // Re-throw error to be caught in the component
    }
    // No need to set loading false here, onAuthStateChanged will do it
  };

  const logout = async () => {
    setLoading(true);
    try {
        await signOut(auth);
        // User state will update via onAuthStateChanged
        router.push('/login'); // Redirect to login after logout
    } catch (error) {
        console.error("Logout Error:", error);
        setLoading(false); // Ensure loading is set to false on error
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
