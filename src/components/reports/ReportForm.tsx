'use client';

import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, FileText, AlertCircle, Lightbulb, Search } from 'lucide-react';
import { ReportStatus, FileAttachment } from '@/types';
import { FileUpload } from '@/components/files/FileUpload';

interface ReportFormProps {
  onSubmit: (data: { title: string; problem: string; findings: string; solutions: string; status: ReportStatus; attachments: FileAttachment[] }) => Promise<void>;
  isSubmitting?: boolean;
}

export function ReportForm({ onSubmit, isSubmitting = false }: ReportFormProps) {
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [findings, setFindings] = useState('');
  const [solutions, setSolutions] = useState('');
  const [status, setStatus] = useState<ReportStatus>('in-progress');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !problem.trim() || !findings.trim() || !solutions.trim()) return;

    setIsLocalSubmitting(true);
    try {
      await onSubmit({ 
        title: title.trim(), 
        problem: problem.trim(), 
        findings: findings.trim(), 
        solutions: solutions.trim(),
        status,
        attachments
      });
      setTitle('');
      setProblem('');
      setFindings('');
      setSolutions('');
      setStatus('in-progress');
      setAttachments([]);
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isLocalSubmitting;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          Submit Research Report
        </CardTitle>
        <CardDescription className="text-xs">
          Document company problems, findings, and solutions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[11px] font-medium">Research Title</Label>
            <Input
              id="title"
              placeholder="e.g., Supply Chain Challenges in Manufacturing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
              className="w-full h-9 text-sm"
            />
          </div>

          {/* Status and Date side by side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status */}
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-[11px] font-medium">Status</Label>
              <Select
                value={status}
                onValueChange={(value: ReportStatus) => setStatus(value)}
                disabled={isLoading}
              >
                <SelectTrigger id="status" className="w-full h-9 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Problem Section */}
          <div className="space-y-1.5">
            <Label htmlFor="problem" className="text-[11px] font-medium flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 bg-red-500 flex items-center justify-center">
                <AlertCircle className="w-2.5 h-2.5 text-white" />
              </div>
              Problem Statement
            </Label>
            <Textarea
              id="problem"
              placeholder="Describe problem faced by companies..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              required
              disabled={isLoading}
              rows={3}
              className="w-full resize-none text-sm min-h-[120px] sm:min-h-[160px]"
            />
          </div>

          {/* Key Findings Section */}
          <div className="space-y-1.5">
            <Label htmlFor="findings" className="text-[11px] font-medium flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 bg-blue-500 flex items-center justify-center">
                <Search className="w-2.5 h-2.5 text-white" />
              </div>
              Key Findings
            </Label>
            <Textarea
              id="findings"
              placeholder="Document your research findings..."
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              required
              disabled={isLoading}
              rows={4}
              className="w-full resize-none text-sm min-h-[120px] sm:min-h-[160px]"
            />
          </div>

          {/* Solutions Section */}
          <div className="space-y-1.5">
            <Label htmlFor="solutions" className="text-[11px] font-medium flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 bg-green-600 flex items-center justify-center">
                <Lightbulb className="w-2.5 h-2.5 text-white" />
              </div>
              Proposed Solutions
            </Label>
            <Textarea
              id="solutions"
              placeholder="Outline recommended solutions..."
              value={solutions}
              onChange={(e) => setSolutions(e.target.value)}
              required
              disabled={isLoading}
              rows={3}
              className="w-full resize-none text-sm min-h-[120px] sm:min-h-[160px]"
            />
          </div>

          <Separator />

          {/* File Upload */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium">Supporting Documents</Label>
            <FileUpload
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              disabled={isLoading}
            />
          </div>

          <Separator />

          {/* Submit / Cancel buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto h-9 text-xs font-medium" 
              onClick={() => {
                setTitle('');
                setProblem('');
                setFindings('');
                setSolutions('');
                setStatus('in-progress');
                setAttachments([]);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="w-full sm:w-auto h-9 text-xs font-medium" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 h-3 w-3" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
