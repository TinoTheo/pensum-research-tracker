'use client';

import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Report, ReportStatus } from '@/types';
import { FileList } from '@/components/files/FileList';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, AlertCircle, Lightbulb, Search } from 'lucide-react';

interface ReportListProps {
  reports: Report[];
  title?: string;
  emptyMessage?: string;
}

const statusConfig: Record<ReportStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; borderClass: string; bgClass: string }> = {
  'in-progress': {
    label: 'In Progress',
    variant: 'default',
    icon: <Clock className="w-3 h-3" />,
    borderClass: 'border-l-amber-500',
    bgClass: 'bg-amber-50 dark:bg-amber-950/20',
  },
  'completed': {
    label: 'Completed',
    variant: 'secondary',
    icon: <CheckCircle className="w-3 h-3" />,
    borderClass: 'border-l-green-600',
    bgClass: 'bg-green-50 dark:bg-green-950/20',
  },
  'blocked': {
    label: 'Blocked',
    variant: 'destructive',
    icon: <XCircle className="w-3 h-3" />,
    borderClass: 'border-l-red-500',
    bgClass: 'bg-red-50 dark:bg-red-950/20',
  },
};

export function ReportList({ reports, title = 'Your Research Reports', emptyMessage = 'No research reports submitted yet' }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <AlertTriangle className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          {title}
          <Badge variant="outline" className="ml-auto font-medium text-[10px]">
            {reports.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-[400px] px-4 pb-4">
          <div className="space-y-2">
            {reports.map((report) => {
              const status = statusConfig[report.status];
              return (
                <div
                  key={report.id}
                  className={`border-l-2 ${status.borderClass} border bg-card hover:bg-muted/30 transition-colors duration-100`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 p-3 pb-2">
                    <h3 className="font-medium text-sm line-clamp-1">{report.title}</h3>
                    <Badge 
                      variant="outline" 
                      className={`flex items-center gap-1 shrink-0 text-[10px] font-medium ${status.bgClass}`}
                    >
                      {status.icon}
                      {status.label}
                    </Badge>
                  </div>

                  <div className="px-3 pb-3 space-y-2">
                    {/* Problem */}
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="w-2.5 h-2.5 bg-red-500 flex items-center justify-center">
                          <AlertCircle className="w-1.5 h-1.5 text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">Problem</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {report.problem}
                      </p>
                    </div>

                    {/* Findings */}
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="w-2.5 h-2.5 bg-blue-500 flex items-center justify-center">
                          <Search className="w-1.5 h-1.5 text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">Findings</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {report.findings}
                      </p>
                    </div>

                    {/* Solutions */}
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="w-2.5 h-2.5 bg-green-600 flex items-center justify-center">
                          <Lightbulb className="w-1.5 h-1.5 text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">Solutions</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {report.solutions}
                      </p>
                    </div>
                    
                    {/* Attachments */}
                    {report.attachments && report.attachments.length > 0 && (
                      <div className="pt-1">
                        <FileList attachments={report.attachments} compact />
                      </div>
                    )}
                    
                    <Separator />
                    
                    {/* Timestamps */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>
                        {format(report.createdAt, 'MMM d, yyyy h:mm a')}
                      </span>
                      {report.updatedAt.getTime() !== report.createdAt.getTime() && (
                        <span>
                          Updated: {format(report.updatedAt, 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
