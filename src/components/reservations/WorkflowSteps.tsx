import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowStage, DocumentStatus } from '@/types/reservation';

interface AssignmentInfo {
  stage: string;
  assigned_user_name?: string;
}

interface StepActor {
  name?: string | null;
  at?: string | null;
  pending?: boolean;
}

interface WorkflowStepsProps {
  currentStage: WorkflowStage;
  documentStatus: DocumentStatus;
  assignments?: AssignmentInfo[];
  stepActors?: Partial<Record<'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6', StepActor>>;
}

const steps = [
  { id: 'step1', label: 'สร้างสัญญาจอง', shortLabel: 'สร้าง' },
  { id: 'step2', label: 'ยืนยันสัญญาจอง', shortLabel: 'ยืนยัน' },
  { id: 'step3', label: 'ตรวจสอบการชำระเงิน', shortLabel: 'ชำระเงิน' },
  { id: 'step4', label: 'ตรวจสอบรายละเอียด', shortLabel: 'ตรวจสอบ' },
  { id: 'step5', label: 'อนุมัติ', shortLabel: 'อนุมัติ' },
  { id: 'step6', label: 'พิมพ์/ลงนาม', shortLabel: 'พิมพ์' },
] as const;

// Map step index to assignment stage
const stepToAssignmentStage: Record<number, string> = {
  2: 'cashier',   // step3: ตรวจสอบการชำระเงิน
  3: 'review',    // step4: ตรวจสอบรายละเอียด
  4: 'approval',  // step5: อนุมัติ
};

function formatThaiDateTime(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const date = d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const time = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${date} ${time}`;
  } catch {
    return null;
  }
}

export function WorkflowSteps({ currentStage, documentStatus, assignments = [], stepActors = {} }: WorkflowStepsProps) {
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
      <div className="flex items-start justify-between relative">
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

          const actor = stepActors[step.id as keyof typeof stepActors];
          const assignmentStage = stepToAssignmentStage[index];
          const assignment = assignmentStage ? assignments.find(a => a.stage === assignmentStage) : undefined;

          // Prefer actor (who actually did it) when stage completed/current; fall back to assignment (who is assigned)
          const showActor = (isCompleted || isCurrent) && (actor?.name || actor?.at);
          const formattedTime = formatThaiDateTime(actor?.at);
          const isPendingPreview = isCurrent && !!actor?.pending && !!actor?.name;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center flex-1 min-w-0 px-1">
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

              {/* Actor name + timestamp (when stage completed or current) */}
              {showActor && actor?.name ? (
                <p
                  className={cn(
                    "text-[10px] md:text-xs mt-1 text-center truncate max-w-[100px] md:max-w-[140px]",
                    isPendingPreview
                      ? "italic text-muted-foreground/80 font-normal"
                      : "text-foreground font-medium"
                  )}
                  title={actor.name}
                >
                  👤 {actor.name}
                </p>
              ) : null}
              {showActor && !isPendingPreview && formattedTime ? (
                <p className="text-[10px] text-muted-foreground mt-0.5 text-center whitespace-nowrap">
                  🕒 {formattedTime}
                </p>
              ) : null}
              {isPendingPreview ? (
                <p className="text-[10px] italic text-muted-foreground/70 mt-0.5 text-center whitespace-nowrap">
                  รอดำเนินการ
                </p>
              ) : null}


              {/* Fallback: show assigned (planned) user when no actor yet */}
              {!showActor && assignment?.assigned_user_name ? (
                <p
                  className="text-[10px] text-muted-foreground mt-1 text-center truncate max-w-[100px] md:max-w-[140px]"
                  title={assignment.assigned_user_name}
                >
                  👤 {assignment.assigned_user_name}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
