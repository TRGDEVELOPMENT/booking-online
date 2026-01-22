import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AttachmentFile {
  id: string;
  file?: File; // Only for new files
  name: string;
  size: number;
  type: string;
  url?: string; // For saved files
  isNew?: boolean;
  filePath?: string; // Storage path for saved files
}

interface UseReservationAttachmentsProps {
  reservationId?: string;
  companyId: string;
}

export function useReservationAttachments({ reservationId, companyId }: UseReservationAttachmentsProps) {
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing attachments
  const loadAttachments = useCallback(async () => {
    if (!reservationId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservation_attachments')
        .select('*')
        .eq('reservation_id', reservationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedAttachments: AttachmentFile[] = (data || []).map((item: {
        id: string;
        file_name: string;
        file_size: number;
        file_type: string;
        file_path: string;
      }) => {
        const { data: urlData } = supabase.storage
          .from('reservation-attachments')
          .getPublicUrl(item.file_path);

        return {
          id: item.id,
          name: item.file_name,
          size: item.file_size,
          type: item.file_type,
          url: urlData.publicUrl,
          filePath: item.file_path,
          isNew: false
        };
      });

      setAttachments(loadedAttachments);
    } catch (error) {
      console.error('Error loading attachments:', error);
      toast.error('ไม่สามารถโหลดเอกสารแนบได้');
    } finally {
      setIsLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    if (reservationId) {
      loadAttachments();
    }
  }, [reservationId, loadAttachments]);

  // Add new files
  const addFiles = useCallback((files: File[]) => {
    const newAttachments: AttachmentFile[] = files.map(file => ({
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      isNew: true
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  }, []);

  // Remove a file
  const removeFile = useCallback(async (id: string) => {
    const attachment = attachments.find(a => a.id === id);
    
    if (!attachment) return;

    // If it's a saved file, delete from storage and database
    if (!attachment.isNew && attachment.filePath) {
      try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('reservation-attachments')
          .remove([attachment.filePath]);

        if (storageError) {
          console.error('Storage delete error:', storageError);
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from('reservation_attachments')
          .delete()
          .eq('id', id);

        if (dbError) throw dbError;

        toast.success('ลบเอกสารแนบสำเร็จ');
      } catch (error) {
        console.error('Error deleting attachment:', error);
        toast.error('ไม่สามารถลบเอกสารแนบได้');
        return;
      }
    }

    setAttachments(prev => prev.filter(a => a.id !== id));
  }, [attachments]);

  // Save all new attachments
  const saveAttachments = useCallback(async (targetReservationId: string) => {
    const newFiles = attachments.filter(a => a.isNew && a.file);
    
    if (newFiles.length === 0) return { success: true, savedCount: 0 };

    setIsSaving(true);
    let savedCount = 0;

    try {
      for (const attachment of newFiles) {
        if (!attachment.file) continue;

        // Generate unique file path
        const fileExt = attachment.name.split('.').pop() || 'file';
        const filePath = `${companyId}/${targetReservationId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('reservation-attachments')
          .upload(filePath, attachment.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();

        // Save to database
        const { error: dbError } = await supabase
          .from('reservation_attachments')
          .insert({
            reservation_id: targetReservationId,
            company_id: companyId,
            file_name: attachment.name,
            file_path: filePath,
            file_size: attachment.size,
            file_type: attachment.type,
            uploaded_by: user?.id
          });

        if (dbError) {
          console.error('DB error:', dbError);
          throw dbError;
        }

        savedCount++;
      }

      // Reload attachments to get the saved versions
      if (targetReservationId === reservationId) {
        await loadAttachments();
      }

      return { success: true, savedCount };
    } catch (error) {
      console.error('Error saving attachments:', error);
      toast.error('ไม่สามารถบันทึกเอกสารแนบได้');
      return { success: false, savedCount };
    } finally {
      setIsSaving(false);
    }
  }, [attachments, companyId, reservationId, loadAttachments]);

  // Open file in new tab
  const openFile = useCallback((attachment: AttachmentFile) => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    } else if (attachment.file) {
      // For new files, create a temporary URL
      const url = URL.createObjectURL(attachment.file);
      window.open(url, '_blank');
    }
  }, []);

  return {
    attachments,
    setAttachments,
    isLoading,
    isSaving,
    addFiles,
    removeFile,
    saveAttachments,
    openFile,
    loadAttachments
  };
}
