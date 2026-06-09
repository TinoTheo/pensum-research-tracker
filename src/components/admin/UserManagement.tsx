'use client';

import React, { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  UserPlus,
  Key,
  Users,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UserRole } from '@/types';

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { reports: number };
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

const ROLE_STYLES: Record<UserRole, string> = {
  ADMIN:      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400',
  SUPERVISOR: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400',
  RESEARCHER: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400',
};

export function UserManagement() {
  const [users, setUsers]               = useState<TeamUser[]>([]);
  const [showForm, setShowForm]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage]           = useState('');
  const [error, setError]               = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [formData, setFormData]         = useState({
    name: '',
    email: '',
    role: 'RESEARCHER' as UserRole,
    department: '',
    defaultPassword: '',
  });

  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error('Failed to fetch users:', e);
    }
  };

  const createUser = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setFormData({ name: '', email: '', role: 'RESEARCHER', department: '', defaultPassword: '' });
        setShowForm(false);
        fetchUsers();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId, newPassword: 'temp123' }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchUsers();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to reset password');
    }
  };

  useEffect(() => {
    if (currentUser) fetchUsers();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <Alert>
        <AlertDescription>Loading…</AlertDescription>
      </Alert>
    );
  }

  const canManage = currentUser.role === 'ADMIN';

  return (
    <div className="space-y-6">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Team</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            All team members, roles, and submission activity
          </p>
        </div>
        {canManage && (
          <Button
            size="sm"
            variant={showForm ? 'outline' : 'default'}
            onClick={() => setShowForm((v) => !v)}
            className="self-start sm:self-auto gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {showForm ? 'Cancel' : 'Add Member'}
            {showForm
              ? <ChevronUp   className="w-3 h-3 ml-0.5" />
              : <ChevronDown className="w-3 h-3 ml-0.5" />
            }
          </Button>
        )}
      </div>

      {/* ── Add member form ──────────────────────────────── */}
      {canManage && showForm && (
        <Card className="shadow-card border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Add New Team Member
            </CardTitle>
            <CardDescription className="text-xs">
              Create a new account. The user can update their password after first login.
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <form onSubmit={createUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="um-name" className="text-xs font-medium">Full Name</Label>
                  <Input
                    id="um-name"
                    placeholder="Jane Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="um-email" className="text-xs font-medium">Email Address</Label>
                  <Input
                    id="um-email"
                    type="email"
                    placeholder="user@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="um-role" className="text-xs font-medium">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v: UserRole) => setFormData({ ...formData, role: v })}
                  >
                    <SelectTrigger id="um-role" className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESEARCHER">Researcher</SelectItem>
                      <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="um-dept" className="text-xs font-medium">Department</Label>
                  <Input
                    id="um-dept"
                    placeholder="e.g. Engineering, Research"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="um-password" className="text-xs font-medium">
                    Default Password
                    <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="um-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Leave blank to auto-generate"
                      value={formData.defaultPassword}
                      onChange={(e) => setFormData({ ...formData, defaultPassword: e.target.value })}
                      className="h-9 text-sm pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="gap-1.5">
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Member
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Status messages ──────────────────────────────── */}
      {message && (
        <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <AlertDescription className="text-xs text-emerald-700 dark:text-emerald-400 ml-1">
            {message}
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-3.5 w-3.5" />
          <AlertDescription className="text-xs ml-1">{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Users table ──────────────────────────────────── */}
      <Card className="shadow-card">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Members</CardTitle>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{users.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile card list */}
          <div className="block lg:hidden divide-y">
            {users.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{getInitials(u.name)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[10px] font-semibold border px-1.5 py-0.5 rounded-full ${ROLE_STYLES[u.role]}`}>
                        {u.role}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {u._count?.reports ?? 0} report{u._count?.reports !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                {canManage && (
                  <ResetPasswordDialog userId={u.id} userName={u.name} onReset={resetPassword} />
                )}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="enterprise-th pl-5">Member</TableHead>
                  <TableHead className="enterprise-th">Email</TableHead>
                  <TableHead className="enterprise-th">Role</TableHead>
                  <TableHead className="enterprise-th">Department</TableHead>
                  <TableHead className="enterprise-th">Status</TableHead>
                  <TableHead className="enterprise-th">Reports</TableHead>
                  {canManage && <TableHead className="enterprise-th pr-5 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/20">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-primary">
                            {getInitials(u.name)}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <span
                        className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${ROLE_STYLES[u.role]}`}
                      >
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.department || '—'}
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{u._count?.reports ?? 0}</TableCell>
                    {canManage && (
                      <TableCell className="text-right pr-5">
                        <ResetPasswordDialog userId={u.id} userName={u.name} onReset={resetPassword} />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Reset password confirmation dialog ─────────────────────── */
function ResetPasswordDialog({
  userId,
  userName,
  onReset,
}: {
  userId: string;
  userName: string;
  onReset: (id: string) => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2.5 gap-1.5 text-xs">
          <Key className="w-3 h-3" />
          Reset
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base">Reset password?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            This will reset <span className="font-medium text-foreground">{userName}</span>'s
            password to a temporary value (<code className="text-xs bg-muted px-1 py-0.5 rounded">temp123</code>).
            They will need to change it on next login.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => onReset(userId)}
          >
            Yes, reset password
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
