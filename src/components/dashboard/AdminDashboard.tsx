'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminReportTable } from '@/components/reports/AdminReportTable';
import { SidebarLayout } from '@/components/layout/AppLayout';
import { Report, ReportFilter, ReportStatus } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  TrendingUp,
  AlertCircle,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/* ─── Colour tokens shared between chart & badges ───────────── */
const C = {
  completed:   'oklch(0.55 0.14 145)',
  inProgress:  'oklch(0.72 0.15 75)',
  blocked:     'oklch(0.55 0.20 25)',
  primary:     'oklch(0.40 0.18 255)',
};

/* ─── Skeleton loader ────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-12 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </SidebarLayout>
  );
}

/* ─── KPI card ───────────────────────────────────────────────── */
function KpiCard({
  icon: Icon,
  label,
  sublabel,
  value,
  accentColor,
  bgColor,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel: string;
  value: number | string;
  accentColor: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <Card
      className="relative overflow-hidden border-0 shadow-card card-hover"
      style={{ borderTop: `2px solid ${accentColor}` }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: bgColor }}
          >
            <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
      </CardContent>
    </Card>
  );
}

/* ─── Custom tooltip for recharts ───────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-lg shadow-popover px-3 py-2 text-xs">
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill || p.color }} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.fill || p.color }} />
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export function AdminDashboard() {
  const { user } = useAuth();
  const [reports, setReports]     = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter]       = useState<ReportFilter>({});

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/submissions');
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Request failed (${res.status})`);
      }
      setReports(await res.json());
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

  const filteredReports = useMemo(() => {
    let result = [...reports];
    if (filter.userId && filter.userId !== 'all') {
      result = result.filter((r) => r.userId === filter.userId);
    }
    if (filter.status && filter.status !== 'all') {
      result = result.filter((r) => r.status === filter.status);
    }
    return result;
  }, [reports, filter]);

  const stats = useMemo(() => ({
    total:       reports.length,
    inProgress:  reports.filter((r) => r.status === 'in-progress').length,
    completed:   reports.filter((r) => r.status === 'completed').length,
    blocked:     reports.filter((r) => r.status === 'blocked').length,
    researchers: new Set(reports.map((r) => r.userId)).size,
  }), [reports]);

  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const handleUpdateStatus = async (reportId: string, status: ReportStatus) => {
    try {
      await fetch(`/api/submissions/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast({ title: 'Status Updated', description: 'Report status has been updated.' });
      fetchReports();
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  };

  /* ── Chart data ─────────────────────────────────────────── */
  const statusPieData = [
    { name: 'Completed',   value: stats.completed,  color: C.completed  },
    { name: 'In Progress', value: stats.inProgress, color: C.inProgress },
    { name: 'Blocked',     value: stats.blocked,    color: C.blocked    },
  ].filter((d) => d.value > 0);

  const researcherBarData = useMemo(() => {
    const acc: Record<string, { name: string; total: number; completed: number; active: number; blocked: number }> = {};
    reports.forEach((r) => {
      const key  = r.user?.name ?? 'Unknown';
      const short = key.split(' ')[0];
      if (!acc[key]) acc[key] = { name: short, total: 0, completed: 0, active: 0, blocked: 0 };
      acc[key].total += 1;
      if (r.status === 'completed')   acc[key].completed += 1;
      if (r.status === 'in-progress') acc[key].active    += 1;
      if (r.status === 'blocked')     acc[key].blocked   += 1;
    });
    return Object.values(acc).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [reports]);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <SidebarLayout>
      <div className="space-y-6">

        {/* ── Page header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Research progress overview &amp; team activity
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            className="self-start sm:self-auto gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>

        {/* ── KPI cards — staggered entry ───────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="animate-enter stagger-1">
            <KpiCard
              icon={FileText}
              label="Total"
              sublabel="All reports"
              value={stats.total}
              accentColor={C.primary}
              bgColor="oklch(0.40 0.18 255 / 0.10)"
              iconColor={C.primary}
            />
          </div>
          <div className="animate-enter stagger-2">
            <KpiCard
              icon={Clock}
              label="Active"
              sublabel="In progress"
              value={stats.inProgress}
              accentColor={C.inProgress}
              bgColor="oklch(0.72 0.15 75 / 0.12)"
              iconColor={C.inProgress}
            />
          </div>
          <div className="animate-enter stagger-3">
            <KpiCard
              icon={CheckCircle2}
              label="Done"
              sublabel="Completed"
              value={stats.completed}
              accentColor={C.completed}
              bgColor="oklch(0.55 0.14 145 / 0.10)"
              iconColor={C.completed}
            />
          </div>
          <div className="animate-enter stagger-4">
            <KpiCard
              icon={XCircle}
              label="Blocked"
              sublabel="Need attention"
              value={stats.blocked}
              accentColor={C.blocked}
              bgColor="oklch(0.55 0.20 25 / 0.10)"
              iconColor={C.blocked}
            />
          </div>
          <div className="animate-enter stagger-5">
            <KpiCard
              icon={Users}
              label="Team"
              sublabel="Researchers"
              value={stats.researchers}
              accentColor="oklch(0.58 0.16 220)"
              bgColor="oklch(0.58 0.16 220 / 0.10)"
              iconColor="oklch(0.58 0.16 220)"
            />
          </div>
        </div>

        {/* ── Completion rate banner ────────────────────────── */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Overall Completion Rate</span>
              </div>
              <span className="text-sm font-bold text-primary">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Completed ({stats.completed})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                In Progress ({stats.inProgress})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                Blocked ({stats.blocked})
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Tabs: Overview / Reports ─────────────────────── */}
        <Tabs defaultValue="overview">
          <TabsList className="h-9 gap-1">
            <TabsTrigger value="overview" className="text-xs gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* ── Overview tab ─────────────────────────────────── */}
          <TabsContent value="overview" className="mt-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Status distribution donut */}
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
                  <CardDescription className="text-xs">
                    Breakdown of all report statuses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statusPieData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                      <AlertCircle className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-sm">No reports yet</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {statusPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <RTooltip content={<ChartTooltip />} />
                        <Legend
                          formatter={(v) => (
                            <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{v}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Researcher activity bar chart */}
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Researcher Activity</CardTitle>
                  <CardDescription className="text-xs">
                    Reports submitted per researcher
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {researcherBarData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                      <AlertCircle className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-sm">No data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={researcherBarData}
                        margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                        barCategoryGap="35%"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <RTooltip content={<ChartTooltip />} />
                        <Bar dataKey="completed" name="Completed"   stackId="s" fill={C.completed}  />
                        <Bar dataKey="active"     name="In Progress" stackId="s" fill={C.inProgress} />
                        <Bar
                          dataKey="blocked"
                          name="Blocked"
                          stackId="s"
                          fill={C.blocked}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Per-researcher progress rows */}
            {researcherBarData.length > 0 && (
              <Card className="shadow-card mt-5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completion by Researcher</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {researcherBarData.map((r) => {
                    const rate = r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0;
                    return (
                      <div key={r.name}>
                        <div className="flex items-center justify-between mb-1 text-xs">
                          <span className="font-medium">{r.name}</span>
                          <span className="text-muted-foreground">{rate}% &mdash; {r.total} report{r.total !== 1 ? 's' : ''}</span>
                        </div>
                        <Progress value={rate} className="h-1.5" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Reports tab ──────────────────────────────────── */}
          <TabsContent value="reports" className="mt-5">
            <AdminReportTable
              reports={filteredReports}
              onFilterChange={setFilter}
              currentFilter={filter}
              onUpdateStatus={handleUpdateStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
}
