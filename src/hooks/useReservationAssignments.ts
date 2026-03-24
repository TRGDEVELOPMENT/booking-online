import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AssignmentStage = 'cashier' | 'review' | 'approval';

export interface Assignment {
  id: string;
  reservation_id: string;
  stage: AssignmentStage;
  assigned_user_id: string;
  assigned_by: string | null;
  assigned_at: string;
  company_id: string;
  branch_id: string | null;
  // Joined fields
  assigned_user_name?: string;
}

export interface UserOption {
  user_id: string;
  full_name: string;
  branch_id: string | null;
}

interface UseReservationAssignmentsProps {
  reservationId?: string;
  companyId: string;
  branchId?: string | null;
}

export function useReservationAssignments({ reservationId, companyId, branchId }: UseReservationAssignmentsProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [usersByRole, setUsersByRole] = useState<Record<string, UserOption[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch assignments for this reservation
  const fetchAssignments = useCallback(async () => {
    if (!reservationId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservation_assignments')
        .select('*')
        .eq('reservation_id', reservationId);

      if (error) throw error;

      // Fetch assigned user names
      if (data && data.length > 0) {
        const userIds = data.map(a => a.assigned_user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        setAssignments(data.map(a => ({
          ...a,
          stage: a.stage as AssignmentStage,
          assigned_user_name: profileMap.get(a.assigned_user_id) || 'ไม่ทราบชื่อ',
        })));
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [reservationId]);

  // Fetch users by role for the dropdown selections
  const fetchUsersByRole = useCallback(async () => {
    if (!companyId) return;
    try {
      // Get all user_roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get profiles for those users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, branch_id')
        .eq('company_id', companyId);

      if (profilesError) throw profilesError;

      // Build map: role -> users (filtered by branch if provided)
      const roleMap: Record<string, UserOption[]> = {};
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      for (const r of (roles || [])) {
        const profile = profileMap.get(r.user_id);
        if (!profile) continue;
        
        // Filter by branch: user must be in same branch or have no branch (company-level)
        if (branchId && profile.branch_id && profile.branch_id !== branchId) continue;

        if (!roleMap[r.role]) roleMap[r.role] = [];
        roleMap[r.role].push({
          user_id: r.user_id,
          full_name: profile.full_name,
          branch_id: profile.branch_id,
        });
      }

      setUsersByRole(roleMap);
    } catch (err) {
      console.error('Error fetching users by role:', err);
    }
  }, [companyId, branchId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    fetchUsersByRole();
  }, [fetchUsersByRole]);

  // Assign or update a user to a stage
  const assignUser = async (stage: AssignmentStage, userId: string) => {
    if (!reservationId) return;
    
    try {
      const { error } = await supabase
        .from('reservation_assignments')
        .upsert({
          reservation_id: reservationId,
          stage,
          assigned_user_id: userId,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          company_id: companyId,
          branch_id: branchId || null,
        }, { onConflict: 'reservation_id,stage' });

      if (error) throw error;
      
      toast.success('มอบหมายผู้รับผิดชอบสำเร็จ');
      await fetchAssignments();
    } catch (err: any) {
      console.error('Error assigning user:', err);
      toast.error('เกิดข้อผิดพลาด: ' + (err.message || ''));
    }
  };

  // Remove assignment
  const removeAssignment = async (stage: AssignmentStage) => {
    if (!reservationId) return;
    
    try {
      const { error } = await supabase
        .from('reservation_assignments')
        .delete()
        .eq('reservation_id', reservationId)
        .eq('stage', stage);

      if (error) throw error;
      
      toast.success('ยกเลิกการมอบหมายสำเร็จ');
      await fetchAssignments();
    } catch (err: any) {
      console.error('Error removing assignment:', err);
      toast.error('เกิดข้อผิดพลาด: ' + (err.message || ''));
    }
  };

  // Get assignment for a specific stage
  const getAssignment = (stage: AssignmentStage) => {
    return assignments.find(a => a.stage === stage);
  };

  return {
    assignments,
    usersByRole,
    isLoading,
    assignUser,
    removeAssignment,
    getAssignment,
    refetch: fetchAssignments,
  };
}
