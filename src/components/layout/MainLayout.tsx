import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  const [selectedCompany, setSelectedCompany] = useState(() => {
    // Initialize from localStorage or default to 'BPK'
    return localStorage.getItem('selectedCompany') || 'BPK';
  });

  // Save to localStorage when company changes
  useEffect(() => {
    localStorage.setItem('selectedCompany', selectedCompany);
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
