'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthContextType, UserRole } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (userId: string): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData(token).then(setUser).catch(console.error);
    }
    setLoading(false);
  }, [fetchUserData]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sign in failed');
      }

      const { user: userData, token } = await response.json();
      
      // Check if user needs to reset password
      if (!userData.isActive) {
        throw new Error('Your password has been reset. Please check your email for reset instructions or contact administrator.');
      }
      
      localStorage.setItem('token', token);
      setUser(userData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, role: UserRole = 'RESEARCHER') => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sign up failed');
      }

      const { user: userData, token } = await response.json();
      localStorage.setItem('token', token);
      setUser(userData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const inviteUser = useCallback(async (email: string, role: UserRole) => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) {
      throw new Error('Only Admin and Supervisor can invite users');
    }

    try {
      const response = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invitation failed');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [user]);

  const acceptInvitationCallback = useCallback(async (token: string, password: string, name: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Accepting invitation failed');
      }

      const { user: userData, authToken } = await response.json();
      localStorage.setItem('token', authToken);
      setUser(userData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      inviteUser, 
      acceptInvitation: acceptInvitationCallback 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
