import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Loader2, Users, Save, Check } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SalesTeam {
  id: string;
  team_name: string;
  supervisor_id: string;
  branch_id: string;
}

interface UserOption {
  user_id: string;
  full_name: string;
  branch_id: string | null;
  role: string;
}

interface TemplateEntry {
  stage: string;
  assigned_user_id: string;
}

const stageConfig = [
  { stage: 'cancel_review', label: 'ตรวจสอบการยกเลิก (หัวหน้าทีมขาย)', role: 'sale_supervisor' },
  { stage: 'cancel_approval', label: 'อนุมัติยกเลิก (ผู้จัดการฝ่ายขาย)', role: 'sale_manager' },
];

export default function SettingsCancelApprovalChainPage() {
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('user_admin') || hasRole('it');

  const [salesTeams, setSalesTeams] = useState<SalesTeam[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [branches, setBranches] = useState<{ branch_id: string; branch_name: string }[]>([]);
  const [teamMemberCounts, setTeamMemberCounts] = useState<Record<string, number>>({});
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [savedTemplates, setSavedTemplates] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const selectedTeam = salesTeams.find(t => t.id === selectedTeamId);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [teamsRes, branchRes, rolesRes, profilesRes] = await Promise.all([
          supabase.from('sales_teams').select('id, team_name, supervisor_id, branch_id').eq('company_id', selectedCompany).eq('status', 'active'),
          supabase.from('branches').select('branch_id, branch_name').eq('company_id', selectedCompany).eq('status', 'active'),
          supabase.from('user_roles').select('user_id, role'),
          supabase.from('profiles').select('user_id, full_name, branch_id').eq('company_id', selectedCompany).eq('status', 'active'),
        ]);

        setSalesTeams(teamsRes.data || []);
        setBranches(branchRes.data || []);

        if (rolesRes.data && profilesRes.data) {
          const profileMap = new Map(profilesRes.data.map(p => [p.user_id, p]));
          const list: UserOption[] = [];
          for (const r of rolesRes.data) {
            const profile = profileMap.get(r.user_id);
            if (profile) {
              list.push({ user_id: r.user_id, full_name: profile.full_name, branch_id: profile.branch_id, role: r.role });
            }
          }
          setUsers(list);
        }

        if (teamsRes.data && teamsRes.data.length > 0) {
          const teamIds = teamsRes.data.map(t => t.id);
          const { data: members } = await supabase.from('sales_team_members').select('team_id').in('team_id', teamIds);
          const counts: Record<string, number> = {};
          for (const m of members || []) {
            counts[m.team_id] = (counts[m.team_id] || 0) + 1;
          }
          setTeamMemberCounts(counts);
        }
      } catch (err) {
        console.error(err);
        toast.error('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany]);

  useEffect(() => {
    if (!selectedTeamId) {
      setTemplates({});
      setSavedTemplates({});
      return;
    }
    const fetchTemplates = async () => {
      const { data } = await supabase
        .from('team_cancel_approval_templates' as any)
        .select('stage, assigned_user_id')
        .eq('team_id', selectedTeamId);

      const map: Record<string, string> = {};
      for (const row of (data || []) as unknown as TemplateEntry[]) {
        map[row.stage] = row.assigned_user_id;
      }
      setTemplates(map);
      setSavedTemplates(map);
    };
    fetchTemplates();
  }, [selectedTeamId]);

  const getUsersForStage = (role: string) => {
    if (!selectedTeam) return [];
    if (role === 'sale_supervisor') {
      return users.filter(u => u.role === role && u.user_id === selectedTeam.supervisor_id);
    }
    return users.filter(u =>
      u.role === role &&
      (!u.branch_id || u.branch_id === selectedTeam.branch_id)
    );
  };

  const handleSave = async () => {
    if (!selectedTeamId || !selectedTeam) return;
    setIsSaving(true);
    try {
      await supabase
        .from('team_cancel_approval_templates' as any)
        .delete()
        .eq('team_id', selectedTeamId);

      const rows = Object.entries(templates)
        .filter(([, userId]) => userId)
        .map(([stage, assigned_user_id]) => ({
          team_id: selectedTeamId,
          stage,
          assigned_user_id,
          company_id: selectedCompany,
          branch_id: selectedTeam.branch_id,
        }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from('team_cancel_approval_templates' as any)
          .insert(rows);
        if (error) throw error;
      }

      setSavedTemplates({ ...templates });
      toast.success('บันทึกเทมเพลตสายอนุมัติยกเลิกสำเร็จ');
    } catch (err: any) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาด: ' + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(templates) !== JSON.stringify(savedTemplates);

  if (!isAdmin) {
    return (
      <>
        <Header title="ปรับปรุงสายอนุมัติยกเลิกใบจอง" subtitle="ไม่มีสิทธิ์เข้าถึง" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="ปรับปรุงสายอนุมัติยกเลิกใบจอง"
        subtitle="ตั้งค่าเทมเพลตผู้รับผิดชอบสายอนุมัติยกเลิก สำหรับแต่ละทีมขาย"
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    เลือกทีมขาย
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="— เลือกทีมขาย —" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesTeams.map(t => {
                        const branchName = branches.find(b => b.branch_id === t.branch_id)?.branch_name || t.branch_id;
                        return (
                          <SelectItem key={t.id} value={t.id}>
                            {t.team_name} ({branchName})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {selectedTeam && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        สาขา: {branches.find(b => b.branch_id === selectedTeam.branch_id)?.branch_name || selectedTeam.branch_id}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        หัวหน้าทีม: {users.find(u => u.user_id === selectedTeam.supervisor_id)?.full_name || '-'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        สมาชิก: {teamMemberCounts[selectedTeamId] || 0} คน
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedTeam && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">กำหนดผู้รับผิดชอบแต่ละขั้นตอน</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {stageConfig.map(({ stage, label, role }) => {
                      const availableUsers = getUsersForStage(role);
                      const currentValue = templates[stage] || '';

                      return (
                        <div key={stage} className="space-y-1.5">
                          <Label className="text-sm font-medium">{label}</Label>
                          <Select
                            value={currentValue}
                            onValueChange={(val) => setTemplates(prev => ({ ...prev, [stage]: val }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="— เลือกผู้รับผิดชอบ —" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableUsers.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">ไม่พบผู้ใช้ที่มีสิทธิ์</div>
                              ) : (
                                availableUsers.map(u => (
                                  <SelectItem key={u.user_id} value={u.user_id}>
                                    {u.full_name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {currentValue && savedTemplates[stage] === currentValue && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <Check className="w-3 h-3" /> บันทึกแล้ว
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="pt-3 border-t">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                        className="w-full sm:w-auto"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        บันทึกเทมเพลต
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!selectedTeamId && (
                <div className="text-center py-12 text-muted-foreground">
                  กรุณาเลือกทีมขายเพื่อตั้งค่าเทมเพลตสายอนุมัติยกเลิก
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
