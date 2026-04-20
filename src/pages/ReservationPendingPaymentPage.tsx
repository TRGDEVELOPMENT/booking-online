import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Search, 
  Wallet,
  Loader2,
  Eye,
  Phone,
  Car,
  User,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { companies } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Reservation = Database['public']['Tables']['reservations']['Row'];

export default function ReservationPendingPaymentPage() {
  const navigate = useNavigate();
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const company = companies.find(c => c.id === selectedCompany);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  // Map of reservation_id → latest "resubmission after cashier return" detail
  const [resubmittedFromCashier, setResubmittedFromCashier] = useState<Record<string, { at: string; deposit?: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch reservations that are confirmed (passed customer confirmation)
  useEffect(() => {
    const fetchPendingPaymentReservations = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('company_id', selectedCompany)
          .eq('confirmation_status', 'confirmed')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reservations:', error);
          toast.error('ไม่สามารถโหลดข้อมูลได้');
          return;
        }

        const list = data || [];
        setReservations(list);

        // Identify reservations that were resubmitted after cashier returned them
        // (only consider rows that haven't been verified yet — cashier_user_id is null)
        const candidateIds = list.filter(r => !(r as any).cashier_user_id).map(r => r.id);
        if (candidateIds.length > 0) {
          const { data: logs } = await supabase
            .from('reservation_activity_logs')
            .select('reservation_id, created_at, details')
            .eq('company_id', selectedCompany)
            .eq('action', 'resubmitted_for_approval')
            .in('reservation_id', candidateIds)
            .order('created_at', { ascending: false });
          const map: Record<string, { at: string; deposit?: number }> = {};
          (logs || []).forEach(l => {
            const det = (l.details as any) || {};
            if (det.returned_from === 'cashier' && !map[l.reservation_id]) {
              map[l.reservation_id] = { at: l.created_at, deposit: det.new_deposit_amount };
            }
          });
          setResubmittedFromCashier(map);
        } else {
          setResubmittedFromCashier({});
        }
      } catch (err) {
        console.error('Error:', err);
        toast.error('เกิดข้อผิดพลาด');
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedCompany) {
      fetchPendingPaymentReservations();
    }
  }, [selectedCompany]);

  // Filter reservations by search term
  const filteredReservations = reservations.filter(res => {
    const searchLower = searchTerm.toLowerCase();
    return (
      res.document_number.toLowerCase().includes(searchLower) ||
      res.customer_name.toLowerCase().includes(searchLower) ||
      (res.model && res.model.toLowerCase().includes(searchLower)) ||
      (res.submodel && res.submodel.toLowerCase().includes(searchLower))
    );
  });

  const handleReceivePayment = (reservationId: string) => {
    // Navigate to edit page with cashier mode
    navigate(`/reservations/${reservationId}/edit?mode=cashier`);
  };

  return (
    <>
      <Header 
        title="ใบจองรอยืนยันรับเงิน"
        subtitle={`${company?.code} - ${company?.name}`}
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
          {/* Search Box */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาด้วยเลขที่เอกสาร, ชื่อลูกค้า, รุ่นรถ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-focus"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="w-4 h-4" />
              <span>รอยืนยันรับเงิน: {filteredReservations.length} รายการ</span>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">ไม่พบใบจองรอยืนยันรับเงิน</h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm 
                    ? 'ไม่พบใบจองที่ตรงกับคำค้นหา' 
                    : 'ยังไม่มีใบจองที่ผ่านการยืนยันสัญญาจอง'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[50px]">ลำดับ</TableHead>
                    <TableHead>เลขที่เอกสาร</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>ผู้จอง</TableHead>
                    <TableHead>รุ่นรถ / สี</TableHead>
                    <TableHead className="text-right">เงินจอง</TableHead>
                    <TableHead className="text-center">ดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((res, index) => (
                    <TableRow key={res.id} className="hover:bg-muted/30">
                      <TableCell className="text-center text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{res.document_number}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(res.created_at).toLocaleDateString('th-TH')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          ยืนยันสัญญาแล้ว
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{res.customer_name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {res.customer_phone || '-'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{res.model || '-'}</div>
                            <div className="text-xs text-muted-foreground">
                              {res.submodel} {res.color ? `/ ${res.color}` : ''}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {res.deposit_amount 
                              ? `฿${res.deposit_amount.toLocaleString()}` 
                              : '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          onClick={() => handleReceivePayment(res.id)}
                          className="gap-2 bg-primary hover:bg-primary/90"
                        >
                          <Wallet className="w-4 h-4" />
                          รับเงิน
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
