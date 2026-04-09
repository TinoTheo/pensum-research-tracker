'use client';

import React, { useState } from 'react';
import { useDemoAuth, demoCredentials } from '@/contexts/DemoAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, User, Shield, Activity } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useDemoAuth();

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  const handleQuickLogin = async (cred: typeof demoCredentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    await handleLogin(cred.email, cred.password);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[400px] bg-sidebar text-sidebar-foreground flex-col justify-between p-8">
        <div>
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-sidebar-primary flex items-center justify-center">
              <p className="text-sidebar-primary-foreground font-bold text-lg">P</p>
            </div>
            <span className="text-lg font-bold">Pensum</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">
            Track Company<br />Research Progress
          </h1>
          <p className="text-sm text-sidebar-foreground/70 max-w-sm">
            Enterprise research tracking for monitoring company problems, 
            findings, and proposed solutions.
          </p>
        </div>
        <div className="text-xs text-sidebar-foreground/50">
          Industrial workforce management system
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm mx-auto space-y-4">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <Activity className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold">Pensum</span>
            </div>
          </div>

          <Card>
            <CardHeader className="space-y-1 text-center pb-3">
              <CardTitle className="text-base font-semibold">Sign In</CardTitle>
              <CardDescription className="text-xs">
                Enter your credentials to access dashboard
              </CardDescription>
              <div className="flex items-center justify-center pt-1">
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-600/30 text-[10px]">
                  <span className="w-1.5 h-1.5 bg-green-500 mr-1" />
                  Demo Mode
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[11px] font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    className="w-full h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[11px] font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="w-full h-9 text-sm"
                  />
                </div>
                <Button type="submit" className="w-full h-9 text-sm font-medium" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Login Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] font-medium text-center text-muted-foreground">
                Quick Login Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {demoCredentials.map((cred) => (
                <Button
                  key={cred.email}
                  variant="outline"
                  className="w-full justify-start h-auto py-2 px-3 border-l-2 border-l-transparent hover:border-l-primary min-h-[44px]"
                  onClick={() => handleQuickLogin(cred)}
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className={`w-7 h-7 flex items-center justify-center shrink-0 ${
                      cred.role === 'admin' ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {cred.role === 'admin' ? (
                        <Shield className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-xs">{cred.name}</div>
                      <div className="text-[10px] text-muted-foreground">{cred.email}</div>
                    </div>
                    <Badge 
                      variant={cred.role === 'admin' ? 'default' : 'secondary'} 
                      className="shrink-0 text-[10px]"
                    >
                      {cred.role === 'admin' ? 'Supervisor' : 'Researcher'}
                    </Badge>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
