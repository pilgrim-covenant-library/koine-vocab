'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

export function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
  show = true,
}: ToastProps) {
  const [visible, setVisible] = useState(show);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setVisible(show);
    setIsExiting(false);
  }, [show]);

  useEffect(() => {
    if (!visible || duration === 0) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 200);
  };

  if (!visible) return null;

  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : type === 'warning' ? AlertTriangle : Info;

  const colorClasses = {
    success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  };

  const iconClasses = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
        'transition-all duration-200',
        isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0 animate-in slide-in-from-bottom-2',
        colorClasses[type]
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0', iconClasses[type])} />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={handleClose}
        className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Hook for managing toast state
export function useToast() {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (props: Omit<ToastProps, 'show' | 'onClose'>) => {
    setToast({ ...props, show: true, onClose: () => setToast(null) });
  };

  const hideToast = () => {
    setToast(null);
  };

  return { toast, showToast, hideToast };
}
