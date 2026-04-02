'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamTimerProps {
  startedAt: number;
  duration: number;
  onExpire: () => void;
}

export function ExamTimer({ startedAt, duration, onExpire }: ExamTimerProps) {
  const calcRemaining = useCallback(
    () => Math.max(0, startedAt + duration - Date.now()),
    [startedAt, duration]
  );

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      const r = calcRemaining();
      setRemaining(r);
      if (r <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [calcRemaining, onExpire]);

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLow = remaining < 10 * 60 * 1000;
  const isCritical = remaining < 5 * 60 * 1000;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 font-mono text-sm font-medium tabular-nums',
        isCritical && 'text-red-500 animate-pulse',
        isLow && !isCritical && 'text-amber-500',
        !isLow && 'text-muted-foreground'
      )}
    >
      <Clock className="w-4 h-4" />
      <span>{display}</span>
    </div>
  );
}
