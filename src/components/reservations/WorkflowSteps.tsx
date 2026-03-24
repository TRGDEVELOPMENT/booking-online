import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowStage, DocumentStatus } from '@/types/reservation';

interface AssignmentInfo {
  stage: string;
  assigned_user_name?: string;
}

interface WorkflowStepsProps {
  currentStage: WorkflowStage;
  documentStatus: DocumentStatus;
  assignments?: AssignmentInfo[];
}

const steps = [
  { id: 'step1', label: 'สร้างสัญญาจอง', shortLabel: 'สร้าง' },
  { id: 'step2', label: 'ยืนยันสัญญาจอง', shortLabel: 'ยืนยัน' },
  { id: 'step3', label: 'ตรวจสอบการชำระเงิน', shortLabel: 'ชำระเงิน' },
  { id: 'step4', label: 'ตรวจสอบรายละเอียด', shortLabel: 'ตรวจสอบ' },
  { id: 'step5', label: 'อนุมัติ', shortLabel: 'อนุมัติ' },
  { id: 'step6', label: 'พิมพ์/ลงนาม', shortLabel: 'พิมพ์' },
];

export function WorkflowSteps({ currentStage, documentStatus }: WorkflowStepsProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStage);
  const isCancelled = documentStatus === 'cancelled' || currentStage === 'step7';

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto mb-2">
            <span className="text-xl">✕</span>
          </div>
          <p className="font-semibold text-red-700">เอกสารถูกยกเลิก</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6 shadow-card">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-muted">
          <div 
            className="h-full bg-gradient-to-r from-primary to-blue-vivid transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300",
                isCompleted && "bg-green-500 border-green-500 text-white",
                isCurrent && "bg-[#2838cd] border-[#2838cd] text-white ring-4 ring-[#2838cd]/20",
                isPending && "bg-muted border-muted text-muted-foreground"
              )}>
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>
              <p className={cn(
                "mt-2 text-xs md:text-sm font-medium text-center whitespace-nowrap",
                isCurrent && "text-primary",
                isCompleted && "text-green-600",
                isPending && "text-muted-foreground"
              )}>
                <span className="hidden md:inline">{step.label}</span>
                <span className="md:hidden">{step.shortLabel}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
