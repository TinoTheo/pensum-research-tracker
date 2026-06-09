'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ReportForm } from '@/components/reports/ReportForm';
import { ReportList } from '@/components/reports/ReportList';
import { SidebarLayout } from '@/components/layout/AppLayout';
import { Report, ReportStatus, FileAttachment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

/* ─── Inline SVG progress ring ───────────────────────────────── */
function ProgressRing({ pct, size = 72 }: { pct: number; size?: number }) {
  const r   = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash  = circ - (pct / 100) * circ;

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth={5}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="oklch(0.55 0.14 145)"
        strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────── */
function WorkerSkeleton() {
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <Skeleton className="h-28 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    </SidebarLayout>
  );
}

/* ─── Stat card ──────────────────────────────────────────────── */
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent: string;
  bg: string;
}) {
  return (
    <Card
      className="border-0 shadow-card overflow-hidden"
      style={{ borderTop: `2px solid ${accent}` }}
    >
      <CardContent className="p-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
          style={{ background: bg }}
        >
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
        <div className="text-xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export function WorkerDashboard() {
  const { user }                      = useAuth();
  const [reports, setReports]         = useState<Report[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [showForm, setShowForm]       = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/submissions');
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setReports((data as Report[]).filter((r) => r.userId === user?.id));
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load reports.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReport = async (data: {
    title: string;
    problem: string;
    findings: string;
    solutions: string;
    status: ReportStatus;
    attachments: FileAttachment[];
  }) => {
    if (!user) return;
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId: user.id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `Failed to submit (${res.status})`);
    }
    toast({
      title: 'Report Submitted',
      description: `Research report submitted successfully.${data.attachments.length > 0 ? ` ${data.attachments.length} file(s) attached.` : ''}`,
    });
    setShowForm(false);
    fetchReports();
  };

  const handleUpdateReport = async (
    reportId: string,
    data: {
      title: string;
      problem: string;
      findings: string;
      solutions: string;
      status: ReportStatus;
      attachments: FileAttachment[];
    }
  ) => {
    const res = await fetch(`/api/submissions/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `Failed to update (${res.status})`);
    }
    toast({ title: 'Report Updated', description: 'Research report has been updated.' });
    fetchReports();
  };

  const stats = useMemo(() => ({
    total:      reports.length,
    inProgress: reports.filter((r) => r.status === 'in-progress').length,
    completed:  reports.filter((r) => r.status === 'completed').length,
    blocked:    reports.filter((r) => r.status === 'blocked').length,
  }), [reports]);

  const completionPct = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const today = format(new Date(), 'EEEE, MMMM d');

  if (isLoading) return <WorkerSkeleton />;

  return (
    <SidebarLayout>
      <div className="space-y-6">

        {/* ── Welcome banner ───────────────────────────────── */}
        <div className="rounded-xl bg-hero-primary border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{today}</p>
            <h2 className="text-xl font-semibold">
              Welcome back, {user?.name?.split(' ')[0] ?? 'Researcher'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.total === 0
                ? 'You have no reports yet. Submit your first research report below.'
                : `You have ${stats.inProgress} report${stats.inProgress !== 1 ? 's' : ''} in progress and ${stats.completed} completed.`}
            </p>
          </div>

          {/* Progress ring */}
          {stats.total > 0 && (
            <div className="flex items-center gap-4 shrink-0">
              <div className="relative flex items-center justify-center">
                <ProgressRing pct={completionPct} size={80} />
                <span className="absolute text-sm font-bold">{completionPct}%</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completion</p>
                <p className="text-xs font-medium">{stats.completed} of {stats.total} done</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Report
          </button>
        </div>

        {/* ── Stat cards ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total reports"
            value={stats.total}
            accent="oklch(0.40 0.18 255)"
            bg="oklch(0.40 0.18 255 / 0.10)"
          />
          <StatCard
            icon={Clock}
            label="In progress"
            value={stats.inProgress}
            accent="oklch(0.72 0.15 75)"
            bg="oklch(0.72 0.15 75 / 0.12)"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.completed}
            accent="oklch(0.55 0.14 145)"
            bg="oklch(0.55 0.14 145 / 0.10)"
          />
          <StatCard
            icon={XCircle}
            label="Blocked"
            value={stats.blocked}
            accent="oklch(0.55 0.20 25)"
            bg="oklch(0.55 0.20 25 / 0.10)"
          />
        </div>

        {/* ── Report form (collapsible) + Report list ───────── */}
        <div className="space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-5">

          {/* Form column */}
          <div className="lg:order-1">
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Submit Research Report
              </h3>
            </div>
            {/* Always show form on desktop; toggle on mobile */}
            <div className={showForm ? 'block' : 'hidden lg:block'}>
              <ReportForm onSubmit={handleSubmitReport} />
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="lg:hidden w-full flex items-center justify-center gap-2 border border-dashed rounded-lg py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tap to open new report form
              </button>
            )}
          </div>

          {/* List column */}
          <div className="lg:order-2">
            <div className="flex items-center gap-1.5 mb-3">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Your Reports
              </h3>
            </div>
            <ReportList reports={reports} onUpdate={handleUpdateReport} />
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
