'use client';

import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  color?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  children,
  color = 'stroke-primary',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(color, 'transition-all duration-500 ease-out')}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// Smaller stat card with progress ring
interface StatRingProps {
  label: string;
  value: number | string;
  progress: number;
  color?: string;
  className?: string;
}

export function StatRing({ label, value, progress, color, className }: StatRingProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <ProgressRing progress={progress} size={80} strokeWidth={6} color={color}>
        <span className="text-lg font-bold">{value}</span>
      </ProgressRing>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
