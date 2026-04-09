'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import { demoStore, demoCredentials } from '@/lib/demo/data';

const DemoAuthContext = createContext<AuthContextType | undefined>(undefined);

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Only run after hydration
  useEffect(() => {
    setMounted(true);
    
    try {
      const savedUser = localStorage.getItem('demoUser');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        parsed.createdAt = new Date(parsed.createdAt);
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem('demoUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const validatedUser = demoStore.validateCredentials(email, password);
    
    if (!validatedUser) {
      setLoading(false);
      throw new Error('Invalid email or password. Try demo credentials shown below.');
    }
    
    setUser(validatedUser);
    if (mounted) {
      localStorage.setItem('demoUser', JSON.stringify(validatedUser));
    }
    setLoading(false);
  }, [mounted]);

  const signOut = useCallback(async () => {
    setUser(null);
    if (mounted) {
      localStorage.removeItem('demoUser');
    }
  }, [mounted]);

  return (
    <DemoAuthContext.Provider value={{ user, firebaseUser: null, loading, signIn, signOut }}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext);
  if (context === undefined) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
}

export { demoCredentials };
