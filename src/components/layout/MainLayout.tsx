import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

export function MainLayout() {
  const [selectedCompany, setSelectedCompany] = useState(() => {
    return localStorage.getItem('selectedCompany') || 'BPK';
  });
  const { profile, roles, signOut } = useAuth();
  const navigate = useNavigate();

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'sale': 'ที่ปรึกษาการขาย',
      'cashier': 'แคชเชียร์',
      'sale_supervisor': 'หัวหน้าทีมขาย',
      'sale_manager': 'ผู้จัดการฝ่ายขาย',
      'user_admin': 'ผู้ดูแลระบบ',
      'it': 'IT Admin',
    };
    return roleMap[role] || role;
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  useEffect(() => {
    localStorage.setItem('selectedCompany', selectedCompany);
    const syncProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ company_id: selectedCompany })
          .eq('user_id', user.id);
      }
    };
    syncProfile();
  }, [selectedCompany]);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        selectedCompany={selectedCompany} 
        onCompanyChange={setSelectedCompany} 
      />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-12 flex items-center justify-end gap-3 px-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-vivid to-primary flex items-center justify-center text-white text-xs font-semibold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-sm">
              <span className="font-medium text-foreground">{profile?.full_name || 'ผู้ใช้งาน'}</span>
              <span className="text-muted-foreground ml-1.5 text-xs">
                ({roles[0] ? getRoleDisplayName(roles[0].role) : 'ไม่ระบุ'})
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <main className="flex-1 overflow-hidden">
          <Outlet context={{ selectedCompany, setSelectedCompany }} />
        </main>
      </div>
    </div>
  );
}
