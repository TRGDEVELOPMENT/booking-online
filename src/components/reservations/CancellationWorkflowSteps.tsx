import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CancellationWorkflowStepsProps {
  cancelRequestStatus: string | null;
  cancelReviewStatus?: string | null;
  cancelApprovalStatus: string | null;
}

const steps = [
  { id: 'request', label: 'บันทึกขอยกเลิกใบจอง', shortLabel: 'บันทึก', role: 'ที่ปรึกษาการขาย' },
  { id: 'approve', label: 'อนุมัติยกเลิกใบจอง', shortLabel: 'อนุมัติ', role: 'ผู้จัดการฝ่ายขาย' },
];

export function CancellationWorkflowSteps({
  cancelRequestStatus,
  cancelApprovalStatus,
}: CancellationWorkflowStepsProps) {
  const getStepStatus = (index: number) => {
    if (index === 0) {
      if (cancelRequestStatus === 'requested') {
        return cancelApprovalStatus === 'approved' ? 'completed' : 'completed';
      }
      return 'pending';
    }
    if (index === 1) {
      if (cancelApprovalStatus === 'approved') return 'completed';
      if (cancelRequestStatus === 'requested') return 'current';
      return 'pending';
    }
    return 'pending';
  };

  const currentIndex = cancelApprovalStatus === 'approved' ? 2
    : cancelRequestStatus === 'requested' ? 1
    : 0;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-card">
      <h3 className="text-sm font-semibold text-red-700 mb-4 text-center">ขั้นตอนการยกเลิกใบจอง</h3>
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        {/* Progress Line */}
        <div className="absolute top-6 left-[25%] right-[25%] h-1 bg-red-100">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          const isPending = status === 'pending';

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300",
                isCompleted && "bg-red-500 border-red-500 text-white",
                isCurrent && "bg-white border-red-500 text-red-500 ring-4 ring-red-200",
                isPending && "bg-white border-muted-foreground/30 text-muted-foreground"
              )}>
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>
              <p className={cn(
                "mt-2 text-xs md:text-sm font-medium text-center",
                isCurrent && "text-red-600",
                isCompleted && "text-red-600",
                isPending && "text-muted-foreground"
              )}>
                <span className="hidden md:inline">{step.label}</span>
                <span className="md:hidden">{step.shortLabel}</span>
              </p>
              <p className={cn(
                "text-[10px] md:text-xs text-center mt-0.5",
                (isCurrent || isCompleted) ? "text-red-500" : "text-muted-foreground/70"
              )}>
                {step.role}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
