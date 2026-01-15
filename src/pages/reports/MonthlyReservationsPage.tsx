import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { CalendarDays, Download, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface MonthlyReservation {
  id: string;
  document_number: string;
  customer_name: string;
  model: string | null;
  submodel: string | null;
  net_price: number | null;
  status: string;
  created_at: string;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'ฉบับร่าง', variant: 'secondary' },
  pending: { label: 'รออนุมัติ', variant: 'outline' },
  approved: { label: 'อนุมัติแล้ว', variant: 'default' },
  rejected: { label: 'ไม่อนุมัติ', variant: 'destructive' },
  final: { label: 'สมบูรณ์', variant: 'default' },
  cancelled: { label: 'ยกเลิก', variant: 'destructive' },
};

export default function MonthlyReservationsPage() {
  const { selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState<MonthlyReservation[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());

  const months = [
    { value: '01', label: 'มกราคม' },
    { value: '02', label: 'กุมภาพันธ์' },
    { value: '03', label: 'มีนาคม' },
    { value: '04', label: 'เมษายน' },
    { value: '05', label: 'พฤษภาคม' },
    { value: '06', label: 'มิถุนายน' },
    { value: '07', label: 'กรกฎาคม' },
    { value: '08', label: 'สิงหาคม' },
    { value: '09', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: `${year + 543}` }; // Buddhist year
  });

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const [year, month] = selectedMonth.split('-');
        const startDate = `${year}-${month}-01`;
        const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('reservations')
          .select('id, document_number, customer_name, model, submodel, net_price, status, created_at')
          .gte('created_at', startDate)
          .lte('created_at', `${endDate}T23:59:59`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReservations(data || []);
      } catch (err) {
        console.error('Error fetching reservations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [selectedMonth]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(`${selectedYear}-${month}`);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const month = selectedMonth.split('-')[1];
    setSelectedMonth(`${year}-${month}`);
  };

  const totalValue = reservations.reduce((sum, r) => sum + (r.net_price || 0), 0);

  return (
    <>
      <Header 
        title="รายงานใบจองรายเดือน" 
        subtitle="รายงานสรุปใบจองแยกตามเดือน"
      />
      
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">กรองข้อมูล:</span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth.split('-')[1]} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="เลือกเดือน" />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="ปี" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1" />
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            ส่งออก Excel
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">จำนวนใบจอง</p>
                <p className="text-2xl font-bold">{reservations.length}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">มูลค่ารวม</p>
                <p className="text-2xl font-bold">{totalValue.toLocaleString()} บาท</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">เฉลี่ยต่อใบ</p>
                <p className="text-2xl font-bold">
                  {reservations.length > 0 
                    ? Math.round(totalValue / reservations.length).toLocaleString() 
                    : 0} บาท
                </p>
              </div>
            </div>
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
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <p>ไม่พบข้อมูลใบจองในเดือนที่เลือก</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>เลขที่เอกสาร</TableHead>
                  <TableHead>ชื่อลูกค้า</TableHead>
                  <TableHead>รุ่นรถ</TableHead>
                  <TableHead className="text-right">มูลค่า</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่สร้าง</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation, index) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">{reservation.document_number}</TableCell>
                    <TableCell>{reservation.customer_name}</TableCell>
                    <TableCell>
                      {reservation.model} {reservation.submodel && `/ ${reservation.submodel}`}
                    </TableCell>
                    <TableCell className="text-right">
                      {(reservation.net_price || 0).toLocaleString()} บาท
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[reservation.status]?.variant || 'secondary'}>
                        {statusLabels[reservation.status]?.label || reservation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(reservation.created_at).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
