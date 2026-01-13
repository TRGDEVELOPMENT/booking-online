import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Plus, Download, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ReservationFilters } from '@/components/reservations/ReservationFilters';
import { ReservationTable } from '@/components/reservations/ReservationTable';
import { mockReservations, companies } from '@/data/mockData';

export default function ReservationList() {
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const company = companies.find(c => c.id === selectedCompany);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    branch: 'all',
    status: 'all',
    stage: 'all',
    search: '',
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      branch: 'all',
      status: 'all',
      stage: 'all',
      search: '',
    });
  };

  // Filter reservations
  const filteredReservations = mockReservations.filter(r => {
    if (r.companyId !== selectedCompany) return false;
    if (filters.branch !== 'all' && r.branchId !== filters.branch) return false;
    if (filters.status !== 'all' && r.documentStatus !== filters.status) return false;
    if (filters.stage !== 'all' && r.workflowStage !== filters.stage) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        r.draftNo.toLowerCase().includes(searchLower) ||
        r.finalNo?.toLowerCase().includes(searchLower) ||
        r.bookingCustomer.firstName.toLowerCase().includes(searchLower) ||
        r.bookingCustomer.lastName.toLowerCase().includes(searchLower) ||
        r.bookingCustomer.phone.includes(searchLower) ||
        r.vehicleModelName.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    return true;
  });

  return (
    <>
      <Header 
        title="รายการใบจอง"
        subtitle={`${company?.code} - ${company?.name}`}
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-4 animate-fade-in">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                ใบจองทั้งหมด ({filteredReservations.length})
              </h2>
              {selectedIds.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  เลือกแล้ว {selectedIds.length} รายการ
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบที่เลือก
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                ส่งออก
              </Button>
              <Link to="/reservations/create">
                <Button className="btn-primary-gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  สร้างใบจองใหม่
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <ReservationFilters
            selectedCompany={selectedCompany}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {/* Table */}
          <ReservationTable
            reservations={filteredReservations}
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
          />
        </div>
      </div>
    </>
  );
}
