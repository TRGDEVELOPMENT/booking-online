import { useState, useEffect } from 'react';
import { UserCheck, Loader2, Search } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function SettingsCancelApprovalChainPage() {
  const { profile } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [profile]);

  const fetchReservations = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('company_id', profile.company_id)
        .not('cancel_request_status', 'is', null)
        .order('cancel_requested_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (err: any) {
      toast.error('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter(r =>
    r.document_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCancelStatus = (r: any) => {
    if (r.cancel_approval_status === 'approved') return { label: 'ยกเลิกแล้ว', variant: 'destructive' as const };
    if (r.cancel_review_status === 'reviewed') return { label: 'รอผู้จัดการอนุมัติ', variant: 'secondary' as const };
    if (r.cancel_request_status === 'requested') return { label: 'รอตรวจสอบ', variant: 'outline' as const };
    return { label: 'ไม่ทราบสถานะ', variant: 'outline' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserCheck className="w-8 h-8 text-red-500" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">ปรับปรุงสายอนุมัติยกเลิกใบจอง</h1>
          <p className="text-sm text-muted-foreground">จัดการผู้รับผิดชอบในสายอนุมัติการยกเลิกใบจอง</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">รายการใบจองที่ขอยกเลิก</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาเลขที่เอกสาร, ชื่อลูกค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">กำลังโหลดข้อมูล...</span>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              ไม่พบรายการใบจองที่ขอยกเลิก
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">ลำดับ</TableHead>
                  <TableHead>เลขที่เอกสาร</TableHead>
                  <TableHead>ชื่อลูกค้า</TableHead>
                  <TableHead>สถานะการยกเลิก</TableHead>
                  <TableHead>เหตุผล</TableHead>
                  <TableHead>วันที่ขอยกเลิก</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((r, index) => {
                  const status = getCancelStatus(r);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{r.document_number}</TableCell>
                      <TableCell>{r.customer_name}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="max-w-48 truncate">{r.cancel_reason || '-'}</TableCell>
                      <TableCell>
                        {r.cancel_requested_at
                          ? new Date(r.cancel_requested_at).toLocaleDateString('th-TH')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
