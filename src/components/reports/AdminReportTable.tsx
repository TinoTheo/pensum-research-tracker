'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Report, ReportStatus, ReportFilter, User, FileAttachment } from '@/types';
import { FileList } from '@/components/files/FileList';
import {
  Filter,
  CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User as UserIcon,
  X,
  Eye,
  Paperclip,
  AlertCircle,
  Lightbulb,
  Search,
  FileText,
} from 'lucide-react';

interface AdminReportTableProps {
  reports: Report[];
  onFilterChange: (filter: ReportFilter) => void;
  currentFilter: ReportFilter;
  onUpdateStatus?: (reportId: string, status: ReportStatus) => void;
}

/* ─── Status display config ──────────────────────────────────── */
const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; icon: React.ReactNode; pillClass: string }
> = {
  'in-progress': {
    label: 'In Progress',
    icon: <Clock className="w-3 h-3" />,
    pillClass: 'status-pill status-pill-inprogress',
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle2 className="w-3 h-3" />,
    pillClass: 'status-pill status-pill-completed',
  },
  blocked: {
    label: 'Blocked',
    icon: <XCircle className="w-3 h-3" />,
    pillClass: 'status-pill status-pill-blocked',
  },
};

/* ─── Report detail dialog ───────────────────────────────────── */
function ReportDetailDialog({ report }: { report: Report }) {
  const status = STATUS_CONFIG[report.status];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
          <Eye className="w-3 h-3" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base font-semibold">
            <span className="truncate">{report.title}</span>
            <span className={status.pillClass}>
              {status.icon}
              {status.label}
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Research by{' '}
            <span className="font-medium text-foreground">
              {report.user?.name ?? 'Unknown'}
            </span>
            {' · '}
            {format(new Date(report.createdAt), 'MMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-3">
          {/* Problem */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-white" />
              </div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Problem Statement
              </h4>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-l-2 border-l-red-500">
              <p className="text-sm whitespace-pre-wrap">{report.problem}</p>
            </div>
          </div>

          {/* Findings */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                <Search className="w-3 h-3 text-white" />
              </div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Key Findings
              </h4>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border-l-2 border-l-blue-500">
              <p className="text-sm whitespace-pre-wrap">{report.findings}</p>
            </div>
          </div>

          {/* Solutions */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center">
                <Lightbulb className="w-3 h-3 text-white" />
              </div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Proposed Solutions
              </h4>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-l-2 border-l-green-600">
              <p className="text-sm whitespace-pre-wrap">{report.solutions}</p>
            </div>
          </div>

          {/* Attachments */}
          {report.attachments && (report.attachments as FileAttachment[]).length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Attachments
                </h4>
              </div>
              <FileList attachments={report.attachments as FileAttachment[]} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main table component ───────────────────────────────────── */
export function AdminReportTable({
  reports,
  onFilterChange,
  currentFilter,
  onUpdateStatus,
}: AdminReportTableProps) {
  const [users, setUsers]                   = useState<User[]>([]);
  const [updatingId, setUpdatingId]         = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDateFrom, setTempDateFrom]     = useState<Date | undefined>(currentFilter.dateFrom);
  const [tempDateTo, setTempDateTo]         = useState<Date | undefined>(currentFilter.dateTo);
  const [searchQuery, setSearchQuery]       = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res  = await fetch('/api/researchers');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    setUpdatingId(reportId);
    try {
      if (onUpdateStatus) onUpdateStatus(reportId, newStatus);
    } finally {
      setTimeout(() => setUpdatingId(null), 150);
    }
  };

  const clearFilters = () => {
    setTempDateFrom(undefined);
    setTempDateTo(undefined);
    setSearchQuery('');
    onFilterChange({});
  };

  const applyDateFilter = () => {
    onFilterChange({ ...currentFilter, dateFrom: tempDateFrom, dateTo: tempDateTo });
  };

  /* Client-side search on top of server-side filters */
  const displayedReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.user?.name ?? '').toLowerCase().includes(q) ||
        r.problem.toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  const hasActiveFilters =
    (currentFilter.userId && currentFilter.userId !== 'all') ||
    (currentFilter.status && currentFilter.status !== 'all') ||
    currentFilter.dateFrom ||
    currentFilter.dateTo ||
    searchQuery.trim();

  return (
    <Card className="shadow-card">
      {/* ── Filter / search bar ──────────────────────────── */}
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-col gap-3">
          {/* Top row: title + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">
                Reports
              </span>
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                {displayedReports.length}
              </Badge>
              {hasActiveFilters && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-primary border-primary/40">
                  Filtered
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Date filter */}
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                    <CalendarIcon className="w-3 h-3" />
                    {tempDateFrom || tempDateTo ? 'Date set' : 'Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">From</Label>
                      <Calendar mode="single" selected={tempDateFrom} onSelect={setTempDateFrom} />
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <Label className="text-xs">To</Label>
                      <Calendar mode="single" selected={tempDateTo} onSelect={setTempDateTo} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={applyDateFilter} className="flex-1">Apply</Button>
                      <Button size="sm" variant="outline" onClick={clearFilters}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="h-8 w-8 p-0"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>

              {/* Clear all */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs text-muted-foreground gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Bottom row: search + selects */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by title, researcher, or problem…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Researcher select */}
            <Select
              value={currentFilter.userId || 'all'}
              onValueChange={(v) => onFilterChange({ ...currentFilter, userId: v })}
            >
              <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs">
                <UserIcon className="w-3 h-3 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Researcher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Researchers</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status select */}
            <Select
              value={currentFilter.status || 'all'}
              onValueChange={(v) =>
                onFilterChange({ ...currentFilter, status: v as ReportStatus | 'all' })
              }
            >
              <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs">
                <Filter className="w-3 h-3 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* ── Mobile card view ─────────────────────────────── */}
        <div className="block lg:hidden p-4 space-y-3">
          {displayedReports.length === 0 ? (
            <EmptyState hasFilters={!!hasActiveFilters} onClear={clearFilters} />
          ) : (
            displayedReports.map((report) => {
              const s = STATUS_CONFIG[report.status];
              return (
                <div
                  key={report.id}
                  className="border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{report.user?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground truncate">{report.title}</p>
                    </div>
                    <span className={`${s.pillClass} ml-2 shrink-0`}>
                      {s.icon}
                      {s.label}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
                    <span className="text-[11px] text-muted-foreground">
                      {format(new Date(report.createdAt), 'MMM d, yyyy')}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {report.attachments && (report.attachments as any[]).length > 0 && (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Paperclip className="w-2.5 h-2.5" />
                          {(report.attachments as any[]).length}
                        </Badge>
                      )}
                      <ReportDetailDialog report={report} />
                      <StatusSelect
                        report={report}
                        updating={updatingId === report.id}
                        onChange={handleStatusChange}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Desktop table view ───────────────────────────── */}
        <div className="hidden lg:block overflow-x-auto">
          {displayedReports.length === 0 ? (
            <div className="p-8">
              <EmptyState hasFilters={!!hasActiveFilters} onClear={clearFilters} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="enterprise-th pl-5">Researcher</TableHead>
                  <TableHead className="enterprise-th">Title</TableHead>
                  <TableHead className="enterprise-th">Status</TableHead>
                  <TableHead className="enterprise-th">Submitted</TableHead>
                  <TableHead className="enterprise-th">Files</TableHead>
                  <TableHead className="enterprise-th text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedReports.map((report) => {
                  const s = STATUS_CONFIG[report.status];
                  return (
                    <TableRow key={report.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium text-sm pl-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-primary">
                              {(report.user?.name ?? '?')[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="truncate max-w-[120px]" title={report.user?.name ?? 'Unknown'}>
                            {report.user?.name ?? 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-sm truncate block" title={report.title}>
                          {report.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={s.pillClass}>
                          {s.icon}
                          {s.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(report.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {report.attachments && (report.attachments as any[]).length > 0 ? (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Paperclip className="w-2.5 h-2.5" />
                            {(report.attachments as any[]).length}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="flex items-center justify-end gap-2">
                          <ReportDetailDialog report={report} />
                          <StatusSelect
                            report={report}
                            updating={updatingId === report.id}
                            onChange={handleStatusChange}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Status select sub-component ───────────────────────────── */
function StatusSelect({
  report,
  updating,
  onChange,
}: {
  report: Report;
  updating: boolean;
  onChange: (id: string, status: ReportStatus) => void;
}) {
  return (
    <Select
      value={report.status}
      onValueChange={(v) => onChange(report.id, v as ReportStatus)}
      disabled={updating}
    >
      <SelectTrigger className="h-7 w-[130px] text-xs">
        {updating
          ? <RefreshCw className="w-3 h-3 animate-spin" />
          : <SelectValue />
        }
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="in-progress">In Progress</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
        <SelectItem value="blocked">Blocked</SelectItem>
      </SelectContent>
    </Select>
  );
}

/* ─── Empty state ────────────────────────────────────────────── */
function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground">
      <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center mb-4">
        <FileText className="w-6 h-6 opacity-50" />
      </div>
      <p className="text-sm font-medium mb-1">
        {hasFilters ? 'No reports match your filters' : 'No reports yet'}
      </p>
      <p className="text-xs max-w-xs">
        {hasFilters
          ? 'Try adjusting or clearing the search and filter criteria.'
          : 'Reports submitted by researchers will appear here.'}
      </p>
      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 text-xs gap-1.5"
          onClick={onClear}
        >
          <X className="w-3 h-3" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
