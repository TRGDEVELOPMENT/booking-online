import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { supabase } from '@/integrations/supabase/client';

export function MainLayout() {
  const [selectedCompany, setSelectedCompany] = useState(() => {
    return localStorage.getItem('selectedCompany') || 'BPK';
  });

  // Save to localStorage and sync profile when company changes
  useEffect(() => {
    localStorage.setItem('selectedCompany', selectedCompany);
    
    // Sync profile company_id for RLS
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
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Outlet context={{ selectedCompany, setSelectedCompany }} />
      </main>
    </div>
  );
}
