'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Report, ReportStatus, ReportFilter, User } from '@/types';
import { demoStore } from '@/lib/demo/data';
import { FileList } from '@/components/files/FileList';
import {
  Filter,
  CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  User as UserIcon,
  X,
  Eye,
  Paperclip,
  AlertCircle,
  Lightbulb,
  Search,
} from 'lucide-react';

interface AdminReportTableProps {
  reports: Report[];
  onFilterChange: (filter: ReportFilter) => void;
  currentFilter: ReportFilter;
  onUpdateStatus?: (reportId: string, status: ReportStatus) => void;
}

const statusConfig: Record<ReportStatus, { label: string; icon: React.ReactNode; bgClass: string; textClass: string }> = {
  'in-progress': {
    label: 'In Progress',
    icon: <Clock className="w-3 h-3" />,
    bgClass: 'bg-amber-50 dark:bg-amber-950/20',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  'completed': {
    label: 'Completed',
    icon: <CheckCircle className="w-3 h-3" />,
    bgClass: 'bg-green-50 dark:bg-green-950/20',
    textClass: 'text-green-700 dark:text-green-400',
  },
  'blocked': {
    label: 'Blocked',
    icon: <XCircle className="w-3 h-3" />,
    bgClass: 'bg-red-50 dark:bg-red-950/20',
    textClass: 'text-red-700 dark:text-red-400',
  },
};

function ReportDetailDialog({ report }: { report: Report }) {
  const status = statusConfig[report.status];
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          <Eye className="w-3 h-3 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base font-semibold">
            <span className="truncate">{report.title}</span>
            <Badge variant="outline" className={`${status.bgClass} ${status.textClass} text-[10px] sm:self-center`}>
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Research by {report.userName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-3">
          {/* Problem Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-red-500 flex items-center justify-center">
                <AlertCircle className="w-2.5 h-2.5 text-white" />
              </div>
              <h4 className="text-[11px] font-semibold text-muted-foreground">Problem Statement</h4>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-3 border-l-2 border-l-red-500">
              <p className="text-sm whitespace-pre-wrap">{report.problem}</p>
            </div>
          </div>
          
          {/* Key Findings Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-blue-500 flex items-center justify-center">
                <Search className="w-2.5 h-2.5 text-white" />
              </div>
              <h4 className="text-[11px] font-semibold text-muted-foreground">Key Findings</h4>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 border-l-2 border-l-blue-500">
              <p className="text-sm whitespace-pre-wrap">{report.findings}</p>
            </div>
          </div>
          
          {/* Solutions Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-green-600 flex items-center justify-center">
                <Lightbulb className="w-2.5 h-2.5 text-white" />
              </div>
              <h4 className="text-[11px] font-semibold text-muted-foreground">Proposed Solutions</h4>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-3 border-l-2 border-l-green-600">
              <p className="text-sm whitespace-pre-wrap">{report.solutions}</p>
            </div>
          </div>
          
          <Separator />
          
          {/* Attachments */}
          {report.attachments && report.attachments.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-muted-foreground">Attachments</h4>
              <FileList attachments={report.attachments} />
            </div>
          )}
          
          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="border p-2">
              <h4 className="text-[10px] font-medium text-muted-foreground mb-0.5">Submitted</h4>
              <p>{format(report.createdAt, 'MMM d, yyyy h:mm a')}</p>
            </div>
            <div className="border p-2">
              <h4 className="text-[10px] font-medium text-muted-foreground mb-0.5">Updated</h4>
              <p>{format(report.updatedAt, 'MMM d, yyyy h:mm a')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminReportTable({ reports, onFilterChange, currentFilter, onUpdateStatus }: AdminReportTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState<Date | undefined>(currentFilter.dateFrom);
  const [tempDateTo, setTempDateTo] = useState<Date | undefined>(currentFilter.dateTo);

  useEffect(() => {
    setUsers(demoStore.getUsers());
  }, []);

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    setUpdatingId(reportId);
    try {
      if (onUpdateStatus) {
        onUpdateStatus(reportId, newStatus);
      }
    } finally {
      setTimeout(() => setUpdatingId(null), 150);
    }
  };

  const clearFilters = () => {
    setTempDateFrom(undefined);
    setTempDateTo(undefined);
    onFilterChange({});
  };

  const applyDateFilter = () => {
    onFilterChange({
      ...currentFilter,
      dateFrom: tempDateFrom,
      dateTo: tempDateTo,
    });
    setIsCalendarOpen(false);
  };

  const hasActiveFilters = currentFilter.status || currentFilter.userId || currentFilter.dateFrom || currentFilter.dateTo;

  // Get researchers only (filter out admin)
  const researchers = users.filter(u => u.role === 'worker');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              Research Reports
              <Badge variant="outline" className="font-medium">
                {reports.length}
              </Badge>
            </CardTitle>
          </div>
          
          {/* Filters Row - Mobile First */}
          <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-2">
            {/* User Filter */}
            <Select
              value={currentFilter.userId || 'all'}
              onValueChange={(value) =>
                onFilterChange({ ...currentFilter, userId: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger className="w-full md:w-[120px] h-9 md:h-7 text-xs">
                <UserIcon className="w-3 h-3 mr-1" />
                <SelectValue placeholder="Researcher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Researchers</SelectItem>
                {researchers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={currentFilter.status || 'all'}
              onValueChange={(value) =>
                onFilterChange({
                  ...currentFilter,
                  status: value === 'all' ? undefined : (value as ReportStatus),
                })
              }
            >
              <SelectTrigger className="w-full md:w-[100px] h-9 md:h-7 text-xs">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto h-9 md:h-7 text-xs font-normal px-2">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  {currentFilter.dateFrom || currentFilter.dateTo ? (
                    <span className="truncate">
                      {currentFilter.dateFrom ? format(currentFilter.dateFrom, 'MMM d') : 'Start'}
                      -
                      {currentFilter.dateTo ? format(currentFilter.dateTo, 'MMM d') : 'End'}
                    </span>
                  ) : (
                    'Date'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="end">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium">From</Label>
                    <Calendar
                      mode="single"
                      selected={tempDateFrom}
                      onSelect={setTempDateFrom}
                      initialFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium">To</Label>
                    <Calendar
                      mode="single"
                      selected={tempDateTo}
                      onSelect={setTempDateTo}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => { setTempDateFrom(undefined); setTempDateTo(undefined); }}>
                      Clear
                    </Button>
                    <Button size="sm" className="flex-1 h-7 text-xs" onClick={applyDateFilter}>
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear All Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="w-full md:w-auto h-9 md:h-7 text-xs px-2" onClick={clearFilters}>
                <X className="w-3 h-3 mr-0.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Filter className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">No reports match your filters</p>
          </div>
        ) : (
          <>
            {/* Mobile Card List */}
            <div className="md:hidden space-y-3 p-4">
              {reports.map((report) => {
                const status = statusConfig[report.status];
                return (
                  <Card key={report.id} className="border">
                    <CardContent className="p-4">
                      {/* Header with name and status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{report.userName}</p>
                        </div>
                        <Badge variant="outline" className={`${status.bgClass} ${status.textClass} text-[10px] ml-2 shrink-0`}>
                          {status.icon}
                          <span className="ml-1">{status.label}</span>
                        </Badge>
                      </div>
                      
                      {/* Problem statement (2-line clamp) */}
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {report.problem}
                        </p>
                      </div>
                      
                      {/* Date */}
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground">
                          {format(report.createdAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <ReportDetailDialog report={report} />
                        <Select
                          value={report.status}
                          onValueChange={(value: ReportStatus) =>
                            handleStatusChange(report.id, value)
                          }
                          disabled={updatingId === report.id}
                        >
                          <div className={`${status.bgClass} border flex-1`}>
                            <SelectTrigger
                              className={`h-9 border-0 bg-transparent text-xs font-medium ${status.textClass}`}
                            >
                              {updatingId === report.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  {status.icon}
                                  <SelectValue />
                                </>
                              )}
                            </SelectTrigger>
                          </div>
                          <SelectContent>
                            <SelectItem value="in-progress">
                              <div className="flex items-center gap-1.5 text-xs">
                                <Clock className="w-3 h-3 text-amber-500" />
                                In Progress
                              </div>
                            </SelectItem>
                            <SelectItem value="completed">
                              <div className="flex items-center gap-1.5 text-xs">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                Completed
                              </div>
                            </SelectItem>
                            <SelectItem value="blocked">
                              <div className="flex items-center gap-1.5 text-xs">
                                <XCircle className="w-3 h-3 text-red-500" />
                                Blocked
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[12%]">Researcher</TableHead>
                    <TableHead className="w-[20%]">Title</TableHead>
                    <TableHead className="hidden md:table-cell w-[24%]">Problem</TableHead>
                    <TableHead className="hidden lg:table-cell w-[8%]">Files</TableHead>
                    <TableHead className="w-[10%]">Date</TableHead>
                    <TableHead className="w-[14%]">Status</TableHead>
                    <TableHead className="w-[12%]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => {
                    const status = statusConfig[report.status];
                    return (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium text-sm truncate" title={report.userName}>
                          {report.userName}
                        </TableCell>
                        <TableCell className="truncate" title={report.title}>
                          <span className="text-sm font-medium">{report.title}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell truncate" title={report.problem}>
                          <span className="text-xs text-muted-foreground">
                            {report.problem}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {report.attachments && report.attachments.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <Paperclip className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs">{report.attachments.length}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(report.createdAt, 'MMM d')}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={report.status}
                            onValueChange={(value: ReportStatus) =>
                              handleStatusChange(report.id, value)
                            }
                            disabled={updatingId === report.id}
                          >
                            <div className={`${status.bgClass} border`}>
                              <SelectTrigger
                                className={`h-7 border-0 bg-transparent text-xs font-medium ${status.textClass}`}
                              >
                                {updatingId === report.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    {status.icon}
                                    <SelectValue />
                                  </>
                                )}
                              </SelectTrigger>
                            </div>
                            <SelectContent>
                              <SelectItem value="in-progress">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  In Progress
                                </div>
                              </SelectItem>
                              <SelectItem value="completed">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  Completed
                                </div>
                              </SelectItem>
                              <SelectItem value="blocked">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <XCircle className="w-3 h-3 text-red-500" />
                                  Blocked
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <ReportDetailDialog report={report} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
