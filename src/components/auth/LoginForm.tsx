'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

type AuthMode = 'signin' | 'signup';

export function LoginForm() {
  const [mode, setMode]         = useState<AuthMode>('signin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [error, setError]       = useState<string | null>(null);
  const { signIn, signUp, loading } = useAuth();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        if (!name.trim()) { setError('Name is required'); return; }
        await signUp(email, password, name);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      if (msg.includes('requires password reset')) {
        setError('Your password has been reset. Please check your email for instructions or contact your administrator.');
      } else {
        setError(msg);
      }
    }
  };

  const switchMode = () => {
    setError(null);
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-dvh bg-background flex overflow-y-auto">

      {/* ── Left brand panel — desktop only ──────────────────────── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-center p-14 shrink-0 border-r border-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Pensum</p>
        <p className="text-xs text-muted-foreground/60 mb-10">Research Tracker</p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight mb-5">
          Enterprise Research<br />Management Platform
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          Track company problems, document key findings, and surface actionable solutions — all in one place.
        </p>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      {/* Mobile: top-aligned so the keyboard never covers the form  */}
      {/* Desktop: vertically centred                                */}
      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center
                      px-5 pt-10 pb-10 sm:px-6 lg:p-6
                      bg-muted/30"
           style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
        <div className="w-full max-w-[400px] space-y-5">

          {/* Mobile wordmark */}
          <div className="lg:hidden mb-1">
            <p className="text-sm font-bold leading-tight">Pensum</p>
            <p className="text-[11px] text-muted-foreground">Research Tracker</p>
          </div>

          {/* Form card */}
          <div className="bg-card border rounded-xl shadow-popover p-6 sm:p-8">

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'signin'
                  ? 'Sign in to access your research dashboard.'
                  : 'Fill in your details to get started.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Error alert */}
              {error && (
                <Alert variant="destructive" className="py-3">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <AlertDescription className="text-xs ml-1">{error}</AlertDescription>
                </Alert>
              )}

              {/* Name (sign-up only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 text-base"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@organisation.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  inputMode="email"
                  className="h-11 text-base"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={mode === 'signin' ? 'Enter your password' : 'Choose a strong password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="h-11 text-base"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium mt-2 gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>

            {/* Mode switch */}
            <div className="mt-5 pt-5 border-t text-center">
              <p className="text-xs text-muted-foreground">
                {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                {' '}
                <button
                  type="button"
                  onClick={switchMode}
                  disabled={loading}
                  className="text-primary font-medium hover:underline underline-offset-2 transition-colors"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
