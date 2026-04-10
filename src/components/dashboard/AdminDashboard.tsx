'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { AdminReportTable } from '@/components/reports/AdminReportTable';
import { SidebarLayout } from '@/components/layout/AppLayout';
import { demoStore } from '@/lib/demo/data';
import { Report, ReportFilter, ReportStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Clock, CheckCircle, XCircle, Users, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function AdminDashboard() {
  const { user } = useDemoAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ReportFilter>({});

  useEffect(() => {
    const unsubscribe = demoStore.subscribeToAllReports((newReports) => {
      setReports(newReports);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // filter reports based on current filter settings
  const filteredReports = useMemo(() => {
    let result = [...reports];

    if (filter.userId && filter.userId !== 'all') {
      result = result.filter((r) => r.userId === filter.userId);
    }

    if (filter.status && filter.status !== 'all') {
      result = result.filter((r) => r.status === filter.status);
    }

    if (filter.dateFrom) {
      result = result.filter((r) => r.createdAt >= filter.dateFrom!);
    }

    if (filter.dateTo) {
      const endDate = new Date(filter.dateTo);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter((r) => r.createdAt <= endDate);
    }

    return result;
  }, [reports, filter]);

  // quick stats
  const stats = {
    total: reports.length,
    inProgress: reports.filter((r) => r.status === 'in-progress').length,
    completed: reports.filter((r) => r.status === 'completed').length,
    blocked: reports.filter((r) => r.status === 'blocked').length,
    researchers: new Set(reports.map(r => r.userId)).size,
  };

  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  const handleUpdateStatus = (reportId: string, status: ReportStatus) => {
    demoStore.updateReportStatus(reportId, status);
    toast({
      title: 'Status Updated',
      description: 'Research report status has been updated successfully.',
    });
  };

  return (
    <SidebarLayout>
      <div className="space-y-4 overflow-x-hidden">
        {/* page header */}
        <div className="border-b pb-3">
          <h2 className="text-xl font-bold">Supervisor Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor and manage all company research reports
          </p>
        </div>

        {/* KPI cards - mobile first */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="border-l-4 border-l-primary min-h-[80px]">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span className="text-xs font-medium sm:text-[11px]">Total</span>
              </div>
              <div className="text-xl font-bold sm:text-2xl">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 min-h-[80px]">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-medium sm:text-[11px]">In Progress</span>
              </div>
              <div className="text-xl font-bold sm:text-2xl">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600 min-h-[80px]">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-medium sm:text-[11px]">Completed</span>
              </div>
              <div className="text-xl font-bold sm:text-2xl">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 min-h-[80px]">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <XCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-medium sm:text-[11px]">Blocked</span>
              </div>
              <div className="text-xl font-bold sm:text-2xl">{stats.blocked}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 min-h-[80px]">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs font-medium sm:text-[11px]">Researchers</span>
              </div>
              <div className="text-xl font-bold sm:text-2xl">{stats.researchers}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 min-h-[80px]">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-xs font-medium sm:text-[11px]">Completion</span>
              </div>
              <div className="text-xl font-bold sm:text-2xl">{completionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* progress bar - mobile first */}
        <Card>
          <CardContent className="p-4">
            {/* mobile: stack label and bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Progress Distribution
              </span>
              <span className="text-xs text-muted-foreground">
                {stats.total} reports
              </span>
            </div>
            <div className="h-2 flex w-full bg-muted">
              {stats.total > 0 && (
                <>
                  <div 
                    className="bg-green-600 h-full transition-all duration-100" 
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  />
                  <div 
                    className="bg-amber-500 h-full transition-all duration-100" 
                    style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                  />
                  <div 
                    className="bg-red-500 h-full transition-all duration-100" 
                    style={{ width: `${(stats.blocked / stats.total) * 100}%` }}
                  />
                </>
              )}
            </div>
            {/* mobile: show percentage below bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
              <div className="text-xs text-muted-foreground sm:hidden">
                Completion Rate: {completionRate}%
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-green-600" />
                  <span className="text-muted-foreground">Completed ({stats.completed})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-amber-500" />
                  <span className="text-muted-foreground">In Progress ({stats.inProgress})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-red-500" />
                  <span className="text-muted-foreground">Blocked ({stats.blocked})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* reports table */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-[300px]">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <AdminReportTable
            reports={filteredReports}
            onFilterChange={setFilter}
            currentFilter={filter}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </SidebarLayout>
  );
}
