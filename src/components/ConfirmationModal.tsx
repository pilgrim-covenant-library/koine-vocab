'use client';

import { useEffect, useRef } from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false,
}: ConfirmationModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus on confirm button when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => confirmButtonRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const Icon = variant === 'danger' ? AlertTriangle : variant === 'warning' ? AlertTriangle : variant === 'info' ? Info : CheckCircle;
  const iconColor = variant === 'danger' ? 'text-red-500' : variant === 'warning' ? 'text-amber-500' : 'text-blue-500';
  const buttonVariant = variant === 'danger' ? 'destructive' : 'default';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
      aria-describedby="confirmation-message"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-sm animate-in fade-in-0 zoom-in-95 duration-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn('p-2 rounded-full', variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30')}>
              <Icon className={cn('w-5 h-5', iconColor)} />
            </div>
            <div className="flex-1">
              <h2 id="confirmation-title" className="text-lg font-semibold mb-1">
                {title}
              </h2>
              <p id="confirmation-message" className="text-sm text-muted-foreground">
                {message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close dialog"
              className="h-8 w-8 -mt-2 -mr-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              ref={confirmButtonRef}
              variant={buttonVariant}
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Loading...' : confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
