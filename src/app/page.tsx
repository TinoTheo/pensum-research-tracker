'use client';

import React from 'react';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { WorkerDashboard } from '@/components/dashboard/WorkerDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useDemoAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <LoginForm />
      </div>
    );
  }

  // send to the right dashboard based on who they are
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <WorkerDashboard />;
}
