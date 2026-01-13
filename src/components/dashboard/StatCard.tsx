import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: {
    bg: 'bg-card',
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  primary: {
    bg: 'bg-gradient-to-br from-primary to-navy-light',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    textColor: 'text-white',
  },
  success: {
    bg: 'bg-card',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  warning: {
    bg: 'bg-card',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  danger: {
    bg: 'bg-card',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const styles = variantStyles[variant];
  const isPrimary = variant === 'primary';

  return (
    <div className={cn(
      "rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50",
      styles.bg
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium mb-1",
            isPrimary ? "text-white/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold",
            isPrimary ? "text-white" : "text-foreground"
          )}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-sm mt-1",
              isPrimary ? "text-white/70" : "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm font-medium",
              trend.isPositive ? "text-green-500" : "text-red-500"
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className={isPrimary ? "text-white/60" : "text-muted-foreground"}>
                จากเดือนก่อน
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          styles.iconBg
        )}>
          <Icon className={cn("w-6 h-6", styles.iconColor)} />
        </div>
      </div>
    </div>
  );
}
