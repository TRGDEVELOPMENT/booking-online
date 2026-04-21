import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Plus, Download, Trash2, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ReservationFilters } from '@/components/reservations/ReservationFilters';
import { ReservationTable } from '@/components/reservations/ReservationTable';
import { companies } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { DatabaseReservation } from '@/types/database-reservation';

export default function ReservationList() {
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const company = companies.find(c => c.id === selectedCompany);

  const [reservations, setReservations] = useState<DatabaseReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [branchMap, setBranchMap] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({
    branch: 'all',
    status: 'all',
    stage: 'all',
    search: '',
  });

  // Fetch reservations from database
  useEffect(() => {
    if (!selectedCompany) return;

    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('company_id', selectedCompany)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reservations:', error);
          toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
          return;
        }

        const transformedData: DatabaseReservation[] = (data || []).map(item => ({
          ...item,
          freebies: Array.isArray(item.freebies) ? item.freebies as DatabaseReservation['freebies'] : null,
          accessories: Array.isArray(item.accessories) ? item.accessories as DatabaseReservation['accessories'] : null,
          benefits: Array.isArray(item.benefits) ? item.benefits as DatabaseReservation['benefits'] : null,
        }));

        setReservations(transformedData);
      } catch (err) {
        console.error('Error:', err);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();

    // Load branches map (branch_id -> branch_name) from DB
    supabase
      .from('branches')
      .select('branch_id, branch_name')
      .eq('company_id', selectedCompany)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching branches:', error);
          return;
        }
        const map: Record<string, string> = {};
        (data || []).forEach((b: any) => { map[b.branch_id] = b.branch_name; });
        setBranchMap(map);
      });

    // Realtime subscription: update list whenever reservations change
    const channel = supabase
      .channel(`reservations-list-${selectedCompany}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations', filter: `company_id=eq.${selectedCompany}` },
        () => { fetchReservations(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCompany]);

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

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .in('id', selectedIds);

      if (error) {
        console.error('Error deleting reservations:', error);
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
        return;
      }

      toast.success(`ลบสำเร็จ ${selectedIds.length} รายการ`);
      setReservations(prev => prev.filter(r => !selectedIds.includes(r.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error('Error:', err);
      toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  // Filter reservations
  const filteredReservations = reservations.filter(r => {
    if (filters.branch !== 'all' && r.branch_id !== filters.branch) return false;
    if (filters.status !== 'all' && r.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        r.document_number.toLowerCase().includes(searchLower) ||
        r.customer_name.toLowerCase().includes(searchLower) ||
        r.customer_phone?.includes(searchLower) ||
        r.model?.toLowerCase().includes(searchLower);
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
      
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full space-y-3 animate-fade-in">
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={handleDeleteSelected}
                  >
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
          {isLoading ? (
            <div className="bg-card rounded-xl border border-border/50 p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <ReservationTable
              reservations={filteredReservations}
              selectedIds={selectedIds}
              onSelectChange={setSelectedIds}
              branchMap={branchMap}
            />
          )}
        </div>
      </div>
    </>
  );
}
