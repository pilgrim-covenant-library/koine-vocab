'use client';

import {
  Heart,
  Brain,
  Eye,
  HelpCircle,
  HeartHandshake,
  AlertTriangle,
  Zap,
  Sparkles,
  Clock,
  MessageSquare,
  Church,
  Globe,
  Copy,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SYNONYM_CATEGORIES, type SynonymCategory } from '@/types';

interface SynonymBadgeProps {
  category: SynonymCategory | string; // Accept any string for extended categories in JSON
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

const categoryIcons: Record<SynonymCategory, React.ReactNode> = {
  love: <Heart className="w-3.5 h-3.5" />,
  know: <Brain className="w-3.5 h-3.5" />,
  see: <Eye className="w-3.5 h-3.5" />,
  ask: <HelpCircle className="w-3.5 h-3.5" />,
  pray: <HeartHandshake className="w-3.5 h-3.5" />,
  sin: <AlertTriangle className="w-3.5 h-3.5" />,
  power: <Zap className="w-3.5 h-3.5" />,
  new: <Sparkles className="w-3.5 h-3.5" />,
  time: <Clock className="w-3.5 h-3.5" />,
  life: <Heart className="w-3.5 h-3.5" />,
  word: <MessageSquare className="w-3.5 h-3.5" />,
  temple: <Church className="w-3.5 h-3.5" />,
  world: <Globe className="w-3.5 h-3.5" />,
  another: <Copy className="w-3.5 h-3.5" />,
  servant: <Users className="w-3.5 h-3.5" />,
  other: <MoreHorizontal className="w-3.5 h-3.5" />,
};

const categoryColors: Record<SynonymCategory, string> = {
  love: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  know: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  see: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  ask: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  pray: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  sin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  power: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  new: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  time: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  life: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  word: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  temple: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  world: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  another: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  servant: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

export function SynonymBadge({
  category,
  size = 'sm',
  showIcon = true,
  className,
}: SynonymBadgeProps) {
  // Handle unknown categories by falling back to 'other'
  const normalizedCategory: SynonymCategory =
    category in SYNONYM_CATEGORIES ? category : 'other';
  const info = SYNONYM_CATEGORIES[normalizedCategory];

  // For display, capitalize the original category if unknown
  const displayLabel = category in SYNONYM_CATEGORIES
    ? info.label
    : category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        categoryColors[normalizedCategory],
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
    >
      {showIcon && categoryIcons[normalizedCategory]}
      <span>{displayLabel}</span>
    </span>
  );
}
