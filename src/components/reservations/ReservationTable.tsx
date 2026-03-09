import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, MoreHorizontal, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DatabaseReservation } from '@/types/database-reservation';
import { DatabaseStatusLabels } from '@/types/database-reservation';
import { branches } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface ReservationTableProps {
  reservations: DatabaseReservation[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
}

const statusStyles: Record<string, string> = {
  draft: 'status-draft',
  final: 'status-complete',
  cancelled: 'status-cancelled',
};

export function ReservationTable({ reservations, selectedIds, onSelectChange }: ReservationTableProps) {
  const allSelected = reservations.length > 0 && selectedIds.length === reservations.length;

  const toggleAll = () => {
    if (allSelected) {
      onSelectChange([]);
    } else {
      onSelectChange(reservations.map(r => r.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return '-';
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || branchId;
  };

  if (reservations.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border/50 p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">ไม่พบข้อมูลใบจอง</h3>
        <p className="text-muted-foreground mb-4">ลองปรับตัวกรองหรือสร้างใบจองใหม่</p>
        <Link to="/reservations/create">
          <Button className="btn-primary-gradient">
            สร้างใบจองใหม่
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="w-12 px-4 py-3">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold">เลขที่เอกสาร</th>
              <th className="text-left px-4 py-3 text-sm font-semibold">สถานะ</th>
              <th className="text-left px-4 py-3 text-sm font-semibold">ผู้จอง</th>
              <th className="text-left px-4 py-3 text-sm font-semibold">รุ่นรถ / สี</th>
              <th className="text-right px-4 py-3 text-sm font-semibold">ราคาสุทธิ</th>
              <th className="text-right px-4 py-3 text-sm font-semibold">เงินจอง</th>
              <th className="text-left px-4 py-3 text-sm font-semibold">สาขา</th>
              <th className="text-left px-4 py-3 text-sm font-semibold">วันที่สร้าง</th>
              <th className="text-center px-4 py-3 text-sm font-semibold">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr 
                key={reservation.id}
                className={cn(
                  "border-b border-border/50 hover:bg-muted/30 transition-colors",
                  selectedIds.includes(reservation.id) && "bg-primary/5"
                )}
              >
                <td className="px-4 py-3">
                  <Checkbox 
                    checked={selectedIds.includes(reservation.id)} 
                    onCheckedChange={() => toggleOne(reservation.id)} 
                  />
                </td>
                <td className="px-4 py-3">
                  <Link 
                    to={`/reservations/${reservation.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {reservation.document_number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge 
                    variant={reservation.status === 'cancelled' ? null : 'default'}
                    className={cn("status-badge w-fit", statusStyles[reservation.status] || 'status-draft')}
                  >
                    {DatabaseStatusLabels[reservation.status] || reservation.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {reservation.customer_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.customer_phone || '-'}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {reservation.model || '-'} {reservation.submodel || ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.color || '-'} {reservation.fuel_type ? `• ${reservation.fuel_type}` : ''}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="font-semibold text-foreground">
                    {reservation.net_price ? `฿${reservation.net_price.toLocaleString()}` : '-'}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="font-semibold text-foreground">
                    {reservation.deposit_amount ? `฿${reservation.deposit_amount.toLocaleString()}` : '-'}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {getBranchName(reservation.branch_id)}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDate(reservation.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-1">
                    <Link to={`/reservations/${reservation.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    {reservation.status === 'draft' && (
                      <Link to={`/reservations/${reservation.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/reservations/${reservation.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            ดูรายละเอียด
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/reservations/${reservation.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            แก้ไข
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/reservations/${reservation.id}/print`}>
                            <Printer className="w-4 h-4 mr-2" />
                            พิมพ์สัญญา
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          แสดง {reservations.length} จาก {reservations.length} รายการ
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            ก่อนหน้า
          </Button>
          <Button variant="outline" size="sm" disabled>
            ถัดไป
          </Button>
        </div>
      </div>
    </div>
  );
}
