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
  const { profile, roles, signOut, hasRole, user } = useAuth();
  const navigate = useNavigate();
  const isIT = hasRole('it');

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
    // For IT Admin only: sync the selected company to profiles.company_id so it
    // becomes the active tenant context (drives RLS-like filtering for queries
    // that read get_user_company_id). Non-IT users are permanently bound to
    // their assigned company and must NOT have it overwritten.
    if (isIT && user?.id && profile && profile.company_id !== selectedCompany) {
      supabase
        .from('profiles')
        .update({ company_id: selectedCompany })
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (!error) {
            // Soft-reload data on the active page by refreshing the route
            window.location.reload();
          }
        });
    }
  }, [selectedCompany, isIT, user?.id, profile?.company_id]);

  return (
    <div className="min-h-screen bg-background flex items-start">
      <Sidebar 
        selectedCompany={selectedCompany} 
        onCompanyChange={setSelectedCompany} 
      />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Header Bar */}
        <header className="h-12 sticky top-0 z-30 flex items-center justify-end gap-2 sm:gap-3 px-3 sm:px-4 border-b border-border bg-card shrink-0">
          {/* Spacer for mobile hamburger button */}
          <div className="w-10 lg:hidden" />
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-vivid to-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-sm min-w-0 hidden xs:block sm:block">
              <span className="font-medium text-foreground truncate">{profile?.full_name || 'ผู้ใช้งาน'}</span>
              <span className="text-muted-foreground ml-1 text-xs hidden sm:inline">
                ({roles[0] ? getRoleDisplayName(roles[0].role) : 'ไม่ระบุ'})
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <main className="flex-1">
          <Outlet context={{ selectedCompany, setSelectedCompany }} />
        </main>
      </div>
    </div>
  );
}
