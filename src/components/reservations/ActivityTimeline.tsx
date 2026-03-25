import { Clock, FileText, CheckCircle, XCircle, Send, Upload, Trash2, UserCheck, RotateCcw, ShieldCheck, CreditCard, Printer } from 'lucide-react';
import type { ActivityLog } from '@/hooks/useReservationActivityLog';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityTimelineProps {
  logs: ActivityLog[];
  isLoading: boolean;
}

const ACTION_ICONS: Record<string, typeof Clock> = {
  created: FileText,
  updated: FileText,
  confirmed: CheckCircle,
  otp_sent: Send,
  link_sent: Send,
  cashier_verified: CreditCard,
  reviewed: UserCheck,
  review_returned: RotateCcw,
  approved: ShieldCheck,
  rejected: XCircle,
  cancel_requested: XCircle,
  cancel_reviewed: UserCheck,
  cancel_approved: XCircle,
  cancel_rejected: RotateCcw,
  assignment_changed: UserCheck,
  attachment_uploaded: Upload,
  attachment_deleted: Trash2,
  printed: Printer,
};

const ACTION_COLORS: Record<string, string> = {
  created: 'text-blue-500 bg-blue-50',
  updated: 'text-blue-500 bg-blue-50',
  confirmed: 'text-green-500 bg-green-50',
  otp_sent: 'text-amber-500 bg-amber-50',
  link_sent: 'text-amber-500 bg-amber-50',
  cashier_verified: 'text-emerald-500 bg-emerald-50',
  reviewed: 'text-indigo-500 bg-indigo-50',
  review_returned: 'text-orange-500 bg-orange-50',
  approved: 'text-green-600 bg-green-50',
  rejected: 'text-red-500 bg-red-50',
  cancel_requested: 'text-red-500 bg-red-50',
  cancel_reviewed: 'text-orange-500 bg-orange-50',
  cancel_approved: 'text-red-600 bg-red-50',
  cancel_rejected: 'text-green-500 bg-green-50',
  assignment_changed: 'text-purple-500 bg-purple-50',
  attachment_uploaded: 'text-sky-500 bg-sky-50',
  attachment_deleted: 'text-gray-500 bg-gray-50',
  printed: 'text-teal-500 bg-teal-50',
};

export function ActivityTimeline({ logs, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="form-section">
        <div className="form-section-header flex items-center gap-2">
          <Clock className="w-5 h-5" />
          ประวัติการดำเนินการ
        </div>
        <div className="space-y-4 p-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="form-section">
        <div className="form-section-header flex items-center gap-2">
          <Clock className="w-5 h-5" />
          ประวัติการดำเนินการ
        </div>
        <p className="text-muted-foreground text-sm p-4">ยังไม่มีประวัติการดำเนินการ</p>
      </div>
    );
  }

  return (
    <div className="form-section">
      <div className="form-section-header flex items-center gap-2">
        <Clock className="w-5 h-5" />
        ประวัติการดำเนินการ ({logs.length} รายการ)
      </div>
      <div className="p-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {logs.map((log, index) => {
              const Icon = ACTION_ICONS[log.action] || Clock;
              const colorClass = ACTION_COLORS[log.action] || 'text-muted-foreground bg-muted';

              return (
                <div key={log.id} className="relative flex gap-3 pl-0">
                  {/* Icon */}
                  <div className={cn(
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    colorClass
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">
                        {log.action_label || log.action}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: th })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      โดย: {log.performed_by_name || 'ไม่ทราบ'}
                    </p>
                    {/* Show details if present */}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                        {(log.details as Record<string, unknown>).remark && (
                          <span>หมายเหตุ: {String((log.details as Record<string, unknown>).remark)}</span>
                        )}
                        {(log.details as Record<string, unknown>).file_name && (
                          <span>ไฟล์: {String((log.details as Record<string, unknown>).file_name)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
