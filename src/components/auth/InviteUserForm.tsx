'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';
import { UserRole } from '@/types';

export function InviteUserForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('RESEARCHER');
  const [loading, setLoading] = useState(false);

  const { user, inviteUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !user) return;
    setLoading(true);
    try {
      await inviteUser(email, role);
      setEmail('');
      setRole('RESEARCHER');
    } catch {
      // handled by context
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERVISOR')) return null;

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="space-y-1 flex-1">
        <Label htmlFor="invite-email" className="text-[11px] font-medium">Email</Label>
        <Input id="invite-email" type="email" placeholder="colleague@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-9 text-sm" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="invite-role" className="text-[11px] font-medium">Role</Label>
        <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
          <SelectTrigger id="invite-role" className="h-9 text-xs w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RESEARCHER">Researcher</SelectItem>
            <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
            {user?.role === 'ADMIN' && <SelectItem value="ADMIN">Admin</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="sm" disabled={loading} className="h-9">
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
      </Button>
    </form>
  );
}
