'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Report, ReportStatus, FileAttachment } from '@/types';
import { FileList } from '@/components/files/FileList';
import { FileUpload } from '@/components/files/FileUpload';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, AlertCircle, Lightbulb, Search, Pencil, Loader2, Save } from 'lucide-react';

interface ReportListProps {
  reports: Report[];
  title?: string;
  emptyMessage?: string;
  onUpdate?: (reportId: string, data: {
    title: string;
    problem: string;
    findings: string;
    solutions: string;
    status: ReportStatus;
    attachments: FileAttachment[];
  }) => Promise<void>;
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

export function ReportList({ reports, title = 'Your Research Reports', emptyMessage = 'No research reports submitted yet', onUpdate }: ReportListProps) {
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editProblem, setEditProblem] = useState('');
  const [editFindings, setEditFindings] = useState('');
  const [editSolutions, setEditSolutions] = useState('');
  const [editStatus, setEditStatus] = useState<ReportStatus>('in-progress');
  const [editAttachments, setEditAttachments] = useState<FileAttachment[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingReport) {
      setEditTitle(editingReport.title);
      setEditProblem(editingReport.problem);
      setEditFindings(editingReport.findings);
      setEditSolutions(editingReport.solutions);
      setEditStatus(editingReport.status);
      setEditAttachments(editingReport.attachments || []);
    }
  }, [editingReport]);

  const openEdit = (report: Report) => {
    setEditingReport(report);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingReport || !editTitle.trim() || !editProblem.trim() || !editFindings.trim() || !editSolutions.trim() || !onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate(editingReport.id, {
        title: editTitle.trim(),
        problem: editProblem.trim(),
        findings: editFindings.trim(),
        solutions: editSolutions.trim(),
        status: editStatus,
        attachments: editAttachments,
      });
      setDialogOpen(false);
      setEditingReport(null);
    } catch {
      // error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

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
    <>
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
                    onClick={() => openEdit(report)}
                    className={`border-l-2 ${status.borderClass} border bg-card hover:bg-muted/50 transition-colors duration-100 cursor-pointer`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 p-3 pb-2">
                      <h3 className="font-medium text-sm line-clamp-2 break-words">{report.title}</h3>
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
                        <p className="text-xs text-muted-foreground line-clamp-2 break-words">
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
                        <p className="text-xs text-muted-foreground line-clamp-2 break-words">
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
                        <p className="text-xs text-muted-foreground line-clamp-2 break-words">
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
                        {new Date(report.updatedAt).getTime() !== new Date(report.createdAt).getTime() && (
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

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              Edit Report
            </DialogTitle>
            <DialogDescription>
              Update the research report details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-title" className="text-[11px] font-medium">Research Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                disabled={isSaving}
                className="w-full h-9 text-sm"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-status" className="text-[11px] font-medium">Status</Label>
              <Select
                value={editStatus}
                onValueChange={(value: ReportStatus) => setEditStatus(value)}
                disabled={isSaving}
              >
                <SelectTrigger id="edit-status" className="w-full h-9 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Problem */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-problem" className="text-[11px] font-medium flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-red-500 flex items-center justify-center">
                  <AlertCircle className="w-2.5 h-2.5 text-white" />
                </div>
                Problem Statement
              </Label>
              <Textarea
                id="edit-problem"
                value={editProblem}
                onChange={(e) => setEditProblem(e.target.value)}
                required
                disabled={isSaving}
                rows={3}
                className="w-full resize-none text-sm min-h-[120px]"
              />
            </div>

            {/* Findings */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-findings" className="text-[11px] font-medium flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-blue-500 flex items-center justify-center">
                  <Search className="w-2.5 h-2.5 text-white" />
                </div>
                Key Findings
              </Label>
              <Textarea
                id="edit-findings"
                value={editFindings}
                onChange={(e) => setEditFindings(e.target.value)}
                required
                disabled={isSaving}
                rows={4}
                className="w-full resize-none text-sm min-h-[120px]"
              />
            </div>

            {/* Solutions */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-solutions" className="text-[11px] font-medium flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-green-600 flex items-center justify-center">
                  <Lightbulb className="w-2.5 h-2.5 text-white" />
                </div>
                Proposed Solutions
              </Label>
              <Textarea
                id="edit-solutions"
                value={editSolutions}
                onChange={(e) => setEditSolutions(e.target.value)}
                required
                disabled={isSaving}
                rows={3}
                className="w-full resize-none text-sm min-h-[120px]"
              />
            </div>

            <Separator />

            {/* Attachments */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium">Supporting Documents</Label>
              <FileUpload
                attachments={editAttachments}
                onAttachmentsChange={setEditAttachments}
                disabled={isSaving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving || !onUpdate}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3 w-3" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
