'use client';

import React, { useState } from 'react';
import { SidebarLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Sun,
  Moon,
  Key,
  Save,
  ShieldAlert,
  Palette,
  UserCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function getInitials(name?: string) {
  if (!name) return 'U';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getRoleLabel(role?: string) {
  if (role === 'ADMIN')      return 'Administrator';
  if (role === 'SUPERVISOR') return 'Supervisor';
  return 'Researcher';
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();

  const [name, setName]             = useState(user?.name ?? '');
  const [newPassword, setNewPwd]    = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [saving, setSaving]         = useState(false);
  const [theme, setTheme]           = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
    toast({ title: `Switched to ${next} mode` });
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/auth/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      toast({ title: 'Profile updated successfully' });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPwd) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/auth/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to change password');
      }
      toast({ title: 'Password changed successfully' });
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const initials  = getInitials(user?.name);
  const roleLabel = getRoleLabel(user?.role);

  return (
    <SidebarLayout>
      <div className="max-w-2xl space-y-6">

        {/* ── Page header ──────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your account preferences and security
          </p>
        </div>

        {/* ── Profile hero card ─────────────────────────────── */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {roleLabel}
                  </span>
                  {user?.department && (
                    <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {user.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Profile details ──────────────────────────────── */}
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-muted-foreground" />
              Profile Details
            </CardTitle>
            <CardDescription className="text-xs">Update your personal information</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="settings-name" className="text-xs font-medium">Full Name</Label>
                  <Input
                    id="settings-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email Address</Label>
                  <Input
                    value={user?.email ?? ''}
                    disabled
                    className="h-9 text-sm text-muted-foreground bg-muted/50"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Role</Label>
                <Input
                  value={roleLabel}
                  disabled
                  className="h-9 text-sm text-muted-foreground bg-muted/50"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
                  {saving
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Save className="w-3.5 h-3.5" />
                  }
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ── Appearance ───────────────────────────────────── */}
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              Appearance
            </CardTitle>
            <CardDescription className="text-xs">Choose your preferred colour scheme</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Currently using {theme} mode
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="gap-1.5"
              >
                {theme === 'light'
                  ? <Moon className="w-3.5 h-3.5" />
                  : <Sun  className="w-3.5 h-3.5" />
                }
                {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Change password ──────────────────────────────── */}
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-muted-foreground" />
              Change Password
            </CardTitle>
            <CardDescription className="text-xs">
              Update your account password. Minimum 6 characters.
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="settings-new-password" className="text-xs font-medium">
                    New Password
                  </Label>
                  <Input
                    id="settings-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-confirm-password" className="text-xs font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="settings-confirm-password"
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
                  {saving
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Key className="w-3.5 h-3.5" />
                  }
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ── Danger zone ──────────────────────────────────── */}
        <Card className="shadow-card border-destructive/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-4 h-4" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-xs">
              Irreversible account actions
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sign out</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You will be returned to the login screen.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={signOut}
                className="gap-1.5"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
