import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  const [selectedCompany, setSelectedCompany] = useState('bpk');

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
