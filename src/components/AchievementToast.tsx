'use client';

import { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Achievement } from '@/types';

interface AchievementToastProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

export function AchievementToast({ achievements, onDismiss }: AchievementToastProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentAchievement = achievements[currentIndex];

  useEffect(() => {
    if (!currentAchievement) {
      onDismiss();
      return;
    }

    // Auto-advance to next achievement or dismiss after 4 seconds
    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for animation
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentIndex, achievements.length, currentAchievement, onDismiss]);

  if (!currentAchievement || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none">
      <div
        role="alert"
        aria-live="assertive"
        aria-label={`Achievement unlocked: ${currentAchievement.name}. ${currentAchievement.description}. Plus ${currentAchievement.xpBonus} experience points.`}
        className={cn(
          'pointer-events-auto',
          'bg-gradient-to-r from-amber-500 to-yellow-500 dark:from-amber-600 dark:to-yellow-600',
          'text-white rounded-xl shadow-2xl p-4 mx-4 max-w-sm w-full',
          'animate-in slide-in-from-top-4 fade-in duration-300',
          !isVisible && 'animate-out slide-out-to-top-4 fade-out duration-300'
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg" aria-hidden="true">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium opacity-90">Achievement Unlocked!</p>
            <p className="font-bold text-lg truncate">{currentAchievement.name}</p>
            <p className="text-sm opacity-90">{currentAchievement.description}</p>
            <p className="text-xs mt-1 font-medium">+{currentAchievement.xpBonus} XP</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss achievement notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {achievements.length > 1 && (
          <div className="flex justify-center gap-1 mt-3" aria-label={`Achievement ${currentIndex + 1} of ${achievements.length}`}>
            {achievements.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-colors',
                  i === currentIndex ? 'bg-white' : 'bg-white/40'
                )}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
