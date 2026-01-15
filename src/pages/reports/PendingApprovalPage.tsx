import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Clock, Download, FileText, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PendingReservation {
  id: string;
  document_number: string;
  customer_name: string;
  customer_phone: string | null;
  model: string | null;
  submodel: string | null;
  net_price: number | null;
  status: string;
  created_at: string;
  created_by: string | null;
}

export default function PendingApprovalPage() {
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState<PendingReservation[]>([]);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('id, document_number, customer_name, customer_phone, model, submodel, net_price, status, created_at, created_by')
        .in('status', ['draft', 'pending'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      toast.success('อนุมัติใบจองสำเร็จ');
      fetchReservations();
    } catch (err) {
      console.error('Error approving reservation:', err);
      toast.error('เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      toast.success('ไม่อนุมัติใบจองสำเร็จ');
      fetchReservations();
    } catch (err) {
      console.error('Error rejecting reservation:', err);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const totalValue = reservations.reduce((sum, r) => sum + (r.net_price || 0), 0);

  const getDaysPending = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <Header 
        title="ใบจองที่ยังไม่อนุมัติ" 
        subtitle="รายการใบจองที่รอการอนุมัติ"
      />
      
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">รอดำเนินการ</p>
                <p className="text-2xl font-bold">{reservations.length} รายการ</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">มูลค่ารวม</p>
                <p className="text-2xl font-bold">{totalValue.toLocaleString()} บาท</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              ส่งออก Excel
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : reservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mb-4 text-green-500 opacity-70" />
              <p className="text-lg font-medium">ไม่มีใบจองที่รอการอนุมัติ</p>
              <p className="text-sm">ใบจองทั้งหมดได้รับการดำเนินการแล้ว</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>เลขที่เอกสาร</TableHead>
                  <TableHead>ชื่อลูกค้า</TableHead>
                  <TableHead>เบอร์โทร</TableHead>
                  <TableHead>รุ่นรถ</TableHead>
                  <TableHead className="text-right">มูลค่า</TableHead>
                  <TableHead>รอมา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-center">การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation, index) => {
                  const daysPending = getDaysPending(reservation.created_at);
                  return (
                    <TableRow key={reservation.id}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{reservation.document_number}</TableCell>
                      <TableCell>{reservation.customer_name}</TableCell>
                      <TableCell>{reservation.customer_phone || '-'}</TableCell>
                      <TableCell>
                        {reservation.model} {reservation.submodel && `/ ${reservation.submodel}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {(reservation.net_price || 0).toLocaleString()} บาท
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={daysPending > 3 ? 'destructive' : daysPending > 1 ? 'outline' : 'secondary'}
                          className="gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          {daysPending} วัน
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          รอดำเนินการ
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/reservations/${reservation.id}/edit`)}
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(reservation.id)}
                            title="อนุมัติ"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleReject(reservation.id)}
                            title="ไม่อนุมัติ"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
