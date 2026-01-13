import { 
  FileEdit, 
  UserCheck, 
  CreditCard, 
  ClipboardCheck, 
  CheckCircle, 
  Printer,
  XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const workflowSteps = [
  { 
    id: 'step1', 
    label: 'สร้างสัญญาจอง', 
    icon: FileEdit, 
    count: 5,
    color: 'bg-gray-500' 
  },
  { 
    id: 'step2', 
    label: 'ยืนยันสัญญาจอง', 
    icon: UserCheck, 
    count: 3,
    color: 'bg-blue-500' 
  },
  { 
    id: 'step3', 
    label: 'ตรวจสอบการชำระเงิน', 
    icon: CreditCard, 
    count: 2,
    color: 'bg-yellow-500' 
  },
  { 
    id: 'step4', 
    label: 'ตรวจสอบรายละเอียด', 
    icon: ClipboardCheck, 
    count: 4,
    color: 'bg-purple-500' 
  },
  { 
    id: 'step5', 
    label: 'อนุมัติ', 
    icon: CheckCircle, 
    count: 8,
    color: 'bg-green-500' 
  },
  { 
    id: 'step6', 
    label: 'พิมพ์/ลงนาม', 
    icon: Printer, 
    count: 12,
    color: 'bg-teal-500' 
  },
  { 
    id: 'step7', 
    label: 'ยกเลิก', 
    icon: XCircle, 
    count: 1,
    color: 'bg-red-500' 
  },
];

export function WorkflowOverview() {
  const totalPending = workflowSteps.slice(0, 5).reduce((sum, step) => sum + step.count, 0);

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">สถานะ Workflow</h2>
        <p className="text-sm text-muted-foreground">
          มีใบจองรอดำเนินการ <span className="font-semibold text-primary">{totalPending}</span> รายการ
        </p>
      </div>

      <div className="space-y-3">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <div className="relative">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white",
                  step.color
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-border" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                  Step {index + 1}: {step.label}
                </p>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-semibold",
                step.count > 0 
                  ? "bg-primary/10 text-primary" 
                  : "bg-muted text-muted-foreground"
              )}>
                {step.count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
