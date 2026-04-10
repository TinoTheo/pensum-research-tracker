'use client';

import React, { useState, useEffect } from 'react';
import { useDemoAuth } from '@/contexts/DemoAuthContext';
import { ReportForm } from '@/components/reports/ReportForm';
import { ReportList } from '@/components/reports/ReportList';
import { SidebarLayout } from '@/components/layout/AppLayout';
import { demoStore } from '@/lib/demo/data';
import { Report, ReportStatus, FileAttachment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function WorkerDashboard() {
  const { user } = useDemoAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = demoStore.subscribeToUserReports(user.id, (newReports) => {
      setReports(newReports);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmitReport = async (data: { title: string; problem: string; findings: string; solutions: string; status: ReportStatus; attachments: FileAttachment[] }) => {
    if (!user) return;

    try {
      demoStore.createReport(user.id, user.name, data);
      toast({
        title: 'Research Report Submitted',
        description: `Your research findings have been submitted successfully.${data.attachments.length > 0 ? ` ${data.attachments.length} file(s) attached.` : ''}`,
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit research report. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // quick stats for this user
  const stats = {
    total: reports.length,
    inProgress: reports.filter((r) => r.status === 'in-progress').length,
    completed: reports.filter((r) => r.status === 'completed').length,
    blocked: reports.filter((r) => r.status === 'blocked').length,
  };

  return (
    <SidebarLayout>
      <div className="space-y-4">
        {/* page header */}
        <div className="border-b pb-3">
          <h2 className="text-xl font-bold">Research Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage your company research reports
          </p>
        </div>

        {/* stats grid - mobile first */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Total</span>
              </div>
              <div className="text-xl font-bold sm:text-2xl">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">In Progress</span>
              </div>
              <div className="text-xl font-bold sm:text-2xl">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Completed</span>
              </div>
              <div className="text-xl font-bold sm:text-2xl">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <XCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Blocked</span>
              </div>
              <div className="text-xl font-bold sm:text-2xl">{stats.blocked}</div>
            </CardContent>
          </Card>
        </div>

        {/* main content - mobile first */}
        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
          {/* report form */}
          <div className="lg:order-1">
            <div className="mb-2">
              <h3 className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Submit New Report
              </h3>
            </div>
            <ReportForm onSubmit={handleSubmitReport} />
          </div>

          {/* report list */}
          <div className="lg:order-2">
            <div className="mb-2">
              <h3 className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Your Reports
              </h3>
            </div>
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center h-[300px]">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : (
              <ReportList reports={reports} />
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
