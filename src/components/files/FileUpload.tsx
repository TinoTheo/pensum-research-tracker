'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileAttachment } from '@/types';
import { 
  Upload, 
  X, 
  FileText, 
  Image as ImageIcon, 
  FileIcon, 
  Loader2,
  Paperclip
} from 'lucide-react';

interface FileUploadProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

// Get icon based on file type
function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <ImageIcon className="w-3.5 h-3.5" />;
  if (type === 'application/pdf') return <FileText className="w-3.5 h-3.5" />;
  return <FileIcon className="w-3.5 h-3.5" />;
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function FileUpload({ 
  attachments, 
  onAttachmentsChange, 
  maxFiles = 5,
  maxSizeMB = 10,
  disabled = false 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    if (attachments.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const maxSize = maxSizeMB * 1024 * 1024;
    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds ${maxSizeMB}MB limit`);
        return;
      }
    }

    setUploading(true);

    try {
      const newAttachments: FileAttachment[] = [];

      for (const file of Array.from(files)) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const attachment: FileAttachment = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          url: base64,
          uploadedAt: new Date(),
        };

        newAttachments.push(attachment);
      }

      onAttachmentsChange([...attachments, ...newAttachments]);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-2">
      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.yaml,.json,.png,.jpg,.jpeg"
          disabled={disabled || uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs font-medium"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || attachments.length >= maxFiles}
        >
          {uploading ? (
            <>
              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-3 h-3 mr-1.5" />
              Upload Files
            </>
          )}
        </Button>
        <span className="text-[10px] text-muted-foreground">
          Max {maxFiles} files, {maxSizeMB}MB each
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* File List */}
      {attachments.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
            <Paperclip className="w-3 h-3" />
            <span>{attachments.length} file{attachments.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 px-2 py-1.5 bg-muted border group"
              >
                <div className={`${attachment.type.startsWith('image/') ? 'text-green-600' : attachment.type === 'application/pdf' ? 'text-red-500' : 'text-blue-500'}`}>
                  {getFileIcon(attachment.type)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium max-w-[120px] truncate">
                    {attachment.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                  onClick={() => removeAttachment(attachment.id)}
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
