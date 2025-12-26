'use client';

import {
  Shield,
  Crown,
  Wind,
  Users,
  Sunrise,
  User,
  AlertTriangle,
  Heart,
  Music,
  BookOpen,
  ScrollText,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { KITTEL_CATEGORIES, type KittelCategory } from '@/types';

interface KittelBadgeProps {
  category: KittelCategory;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

const categoryIcons: Record<KittelCategory, React.ReactNode> = {
  salvation: <Shield className="w-3.5 h-3.5" />,
  christology: <Crown className="w-3.5 h-3.5" />,
  pneumatology: <Wind className="w-3.5 h-3.5" />,
  ecclesiology: <Users className="w-3.5 h-3.5" />,
  eschatology: <Sunrise className="w-3.5 h-3.5" />,
  anthropology: <User className="w-3.5 h-3.5" />,
  hamartiology: <AlertTriangle className="w-3.5 h-3.5" />,
  ethics: <Heart className="w-3.5 h-3.5" />,
  worship: <Music className="w-3.5 h-3.5" />,
  revelation: <BookOpen className="w-3.5 h-3.5" />,
  covenant: <ScrollText className="w-3.5 h-3.5" />,
  faith: <Sparkles className="w-3.5 h-3.5" />,
  other: <MoreHorizontal className="w-3.5 h-3.5" />,
};

const categoryColors: Record<KittelCategory, string> = {
  salvation: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  christology: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  pneumatology: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  ecclesiology: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  eschatology: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  anthropology: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  hamartiology: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  ethics: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  worship: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  revelation: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  covenant: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  faith: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

export function KittelBadge({
  category,
  size = 'sm',
  showIcon = true,
  className,
}: KittelBadgeProps) {
  const info = KITTEL_CATEGORIES[category];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        categoryColors[category],
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
    >
      {showIcon && categoryIcons[category]}
      <span>{info.label}</span>
    </span>
  );
}
