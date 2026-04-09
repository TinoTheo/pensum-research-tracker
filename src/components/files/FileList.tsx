'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileAttachment } from '@/types';
import { 
  Download, 
  ExternalLink,
  FileText, 
  Image as ImageIcon, 
  FileIcon,
  Paperclip
} from 'lucide-react';

interface FileListProps {
  attachments: FileAttachment[];
  compact?: boolean;
}

// Get icon based on file type
function getFileIcon(type: string, className = "w-3.5 h-3.5") {
  if (type.startsWith('image/')) return <ImageIcon className={className} />;
  if (type === 'application/pdf') return <FileText className={className} />;
  return <FileIcon className={className} />;
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Download file from data URL
function downloadFile(attachment: FileAttachment) {
  const link = document.createElement('a');
  link.href = attachment.url;
  link.download = attachment.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Open file in new tab
function viewFile(attachment: FileAttachment) {
  const newWindow = window.open();
  if (newWindow) {
    if (attachment.type.startsWith('image/')) {
      newWindow.document.write(`
        <html>
          <head><title>${attachment.name}</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1a1a1a;">
            <img src="${attachment.url}" style="max-width:100%;max-height:100vh;" />
          </body>
        </html>
      `);
    } else if (attachment.type === 'application/pdf') {
      newWindow.document.write(`
        <html>
          <head><title>${attachment.name}</title></head>
          <body style="margin:0;">
            <embed src="${attachment.url}" type="application/pdf" width="100%" height="100%" />
          </body>
        </html>
      `);
    } else {
      newWindow.close();
      downloadFile(attachment);
    }
  }
}

export function FileList({ attachments, compact = false }: FileListProps) {
  if (attachments.length === 0) {
    return <span className="text-xs text-muted-foreground">No files</span>;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Paperclip className="w-3 h-3 text-muted-foreground" />
        <Badge variant="secondary" className="text-[10px] font-medium">
          {attachments.length}
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
        <Paperclip className="w-3 h-3" />
        <span>Attachments ({attachments.length})</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-muted/50 border hover:bg-muted transition-colors duration-100 group"
          >
            <div className={`${attachment.type.startsWith('image/') ? 'text-green-600' : attachment.type === 'application/pdf' ? 'text-red-500' : 'text-blue-500'}`}>
              {getFileIcon(attachment.type)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium truncate max-w-[160px]" title={attachment.name}>
                {attachment.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {formatFileSize(attachment.size)}
              </span>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
              {(attachment.type.startsWith('image/') || attachment.type === 'application/pdf') && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => viewFile(attachment)}
                  title="View"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => downloadFile(attachment)}
                title="Download"
              >
                <Download className="w-2.5 h-2.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
