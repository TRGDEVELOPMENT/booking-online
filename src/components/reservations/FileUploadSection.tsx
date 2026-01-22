import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload, Trash2, FileText, Image, File } from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

interface FileUploadSectionProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  disabled?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) {
    return <Image className="w-4 h-4 text-primary" />;
  } else if (type === 'application/pdf') {
    return <FileText className="w-4 h-4 text-destructive" />;
  }
  return <File className="w-4 h-4 text-muted-foreground" />;
};

export default function FileUploadSection({
  files,
  onFilesChange,
  disabled = false,
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx",
  maxFiles = 10,
  maxSizeMB = 10
}: FileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled) return;
    
    const newFiles: UploadedFile[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    Array.from(selectedFiles).forEach((file) => {
      // Check file count limit
      if (files.length + newFiles.length >= maxFiles) {
        return;
      }
      
      // Check file size
      if (file.size > maxSizeBytes) {
        return;
      }
      
      // Check for duplicates
      const isDuplicate = files.some(f => f.name === file.name && f.size === file.size);
      if (isDuplicate) {
        return;
      }
      
      newFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type
      });
    });
    
    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
  }, [files, onFilesChange, disabled, maxFiles, maxSizeMB]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    if (disabled) return;
    onFilesChange(files.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="form-section">
      <div className="form-section-header flex items-center gap-2">
        <Paperclip className="w-5 h-5" />
        เอกสารแนบ
      </div>
      
      {/* Drop Zone */}
      <div 
        className={`p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-primary bg-primary/10' 
            : disabled 
              ? 'border-muted bg-muted/30 cursor-not-allowed' 
              : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className={`w-8 h-8 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-muted-foreground text-sm">
            ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
          </p>
          <p className="text-xs text-muted-foreground">
            รองรับ: รูปภาพ, PDF, Word, Excel (สูงสุด {maxSizeMB}MB ต่อไฟล์, {maxFiles} ไฟล์)
          </p>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            className="mt-2"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            เลือกไฟล์
          </Button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            ไฟล์ที่เลือก ({files.length}/{maxFiles})
          </p>
          <div className="space-y-2">
            {files.map((file) => (
              <div 
                key={file.id}
                className="flex items-center justify-between gap-3 p-3 bg-background border border-border rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getFileIcon(file.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
