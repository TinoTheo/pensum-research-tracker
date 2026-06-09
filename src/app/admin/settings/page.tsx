'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Users, Mail, Shield, Database, ArrowLeft, ChevronRight, FlaskConical } from 'lucide-react';

export default function TeamSettings() {
  const [settings, setSettings] = useState({
    companyName: 'Pensum Research Tracker',
    maxUsers: 100,
    allowInvitations: true,
    requireApproval: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { user } = useAuth();
  const router = useRouter();

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!user || user.role !== 'ADMIN') {
      setError('Only administrators can change team settings');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Settings saved successfully');
      } else {
        setError(data.message || 'Failed to save settings');
      }
    } catch {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <Alert>
        <AlertDescription>
          Only administrators can access team settings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 animate-page-in">

      {/* ── Page header with back navigation ─────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5 text-muted-foreground hover:text-foreground -ml-1 h-8 px-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>
          <nav className="flex items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <FlaskConical className="w-3 h-3 shrink-0" />
            <span>Pensum</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span>Admin</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-foreground font-medium">Settings</span>
          </nav>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Admin Settings</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              System-wide configuration for your Pensum workspace
            </p>
          </div>
        </div>
      </div>

      {/* ── Settings card ─────────────────────────────────────── */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-4 h-4 text-muted-foreground" />
            Workspace Configuration
          </CardTitle>
          <CardDescription>
            Adjust platform-wide settings. Changes apply to all users immediately.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                  placeholder="Your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUsers">Maximum Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={settings.maxUsers}
                  onChange={(e) => setSettings({...settings, maxUsers: parseInt(e.target.value)})}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allowInvitations">Allow Invitations</Label>
                <Select
                  value={settings.allowInvitations.toString()}
                  onValueChange={(value) => setSettings({...settings, allowInvitations: value === 'true'})}
                >
                  <SelectTrigger id="allowInvitations">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes — anyone with a link can join</SelectItem>
                    <SelectItem value="false">No — invitations disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requireApproval">Require Admin Approval</Label>
                <Select
                  value={settings.requireApproval.toString()}
                  onValueChange={(value) => setSettings({...settings, requireApproval: value === 'true'})}
                >
                  <SelectTrigger id="requireApproval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes — admin must approve new accounts</SelectItem>
                    <SelectItem value="false">No — accounts are active immediately</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* System information */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">System Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-background border flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                    <p className="text-lg font-bold leading-tight">—</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-background border flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Invitations Sent</p>
                    <p className="text-lg font-bold leading-tight">—</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-background border flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Database</p>
                    <p className="text-sm font-medium leading-tight">Neon PostgreSQL</p>
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={loading} className="min-w-[120px]">
                {loading ? 'Saving…' : 'Save Settings'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
