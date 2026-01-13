import { Link } from 'react-router-dom';
import { Eye, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockReservations } from '@/data/mockData';
import { WorkflowStageLabels, DocumentStatusLabels } from '@/types/reservation';
import { cn } from '@/lib/utils';

const statusStyles = {
  draft: 'status-draft',
  final: 'status-complete',
  cancelled: 'status-cancelled',
};

const stageStyles = {
  step1: 'bg-gray-100 text-gray-700',
  step2: 'bg-blue-100 text-blue-700',
  step3: 'bg-yellow-100 text-yellow-700',
  step4: 'bg-purple-100 text-purple-700',
  step5: 'bg-green-100 text-green-700',
  step6: 'bg-teal-100 text-teal-700',
  step7: 'bg-red-100 text-red-700',
};

export function RecentReservations() {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">ใบจองล่าสุด</h2>
          <p className="text-sm text-muted-foreground">รายการใบจองที่อัปเดตล่าสุด</p>
        </div>
        <Link to="/reservations">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            ดูทั้งหมด
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="text-left px-6 py-3 text-sm font-semibold">เลขที่เอกสาร</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">สถานะ</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">ผู้จอง</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">รุ่นรถ</th>
              <th className="text-right px-6 py-3 text-sm font-semibold">เงินจอง</th>
              <th className="text-center px-6 py-3 text-sm font-semibold">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {mockReservations.map((reservation, index) => (
              <tr 
                key={reservation.id} 
                className={cn(
                  "border-b border-border/50 hover:bg-muted/30 transition-colors",
                  index % 2 === 0 ? "bg-card" : "bg-muted/10"
                )}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {reservation.finalNo || reservation.draftNo}
                    </p>
                    {reservation.finalNo && (
                      <p className="text-xs text-muted-foreground">
                        Draft: {reservation.draftNo}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <Badge className={cn("status-badge w-fit", statusStyles[reservation.documentStatus])}>
                      {DocumentStatusLabels[reservation.documentStatus]}
                    </Badge>
                    <Badge className={cn("status-badge w-fit text-xs", stageStyles[reservation.workflowStage])}>
                      {WorkflowStageLabels[reservation.workflowStage]}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {reservation.bookingCustomer.title} {reservation.bookingCustomer.firstName} {reservation.bookingCustomer.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.bookingCustomer.phone}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {reservation.vehicleModelName} {reservation.vehicleSubmodelName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.vehicleColorName} • {reservation.fuelType}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-semibold text-foreground">
                    {reservation.depositAmount ? `฿${reservation.depositAmount.toLocaleString()}` : '-'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <Link to={`/reservations/${reservation.id}`}>
                      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                        <Eye className="w-4 h-4 mr-1" />
                        ดู
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
