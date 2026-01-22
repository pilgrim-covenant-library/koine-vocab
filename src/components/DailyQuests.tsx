'use client';

import { useEffect, useState, memo } from 'react';
import { BookOpen, Target, Star, Flame, Award, Zap, GraduationCap, Library, Gift, Check } from 'lucide-react';
import { useQuestStore } from '@/stores/questStore';
import { useUserStore } from '@/stores/userStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import type { Quest } from '@/lib/quests';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'book': BookOpen,
  'book-open': BookOpen,
  'target': Target,
  'star': Star,
  'flame': Flame,
  'award': Award,
  'zap': Zap,
  'graduation-cap': GraduationCap,
  'library': Library,
};

interface DailyQuestsProps {
  compact?: boolean;
}

export function DailyQuests({ compact = false }: DailyQuestsProps) {
  const [mounted, setMounted] = useState(false);
  const [claimingAll, setClaimingAll] = useState(false);
  const {
    getCurrentQuests,
    getQuestProgress,
    isQuestCompleted,
    isQuestClaimed,
    claimAllRewards,
    getTotalUnclaimedRewards,
    initializeQuests,
  } = useQuestStore();
  const { addXP } = useUserStore();

  useEffect(() => {
    setMounted(true);
    initializeQuests();
  }, [initializeQuests]);

  const quests = getCurrentQuests();
  const totalUnclaimed = getTotalUnclaimedRewards();

  const handleClaimAll = () => {
    if (totalUnclaimed <= 0) return;
    setClaimingAll(true);

    const xp = claimAllRewards();
    if (xp > 0) {
      addXP(xp);
    }

    setTimeout(() => setClaimingAll(false), 500);
  };

  if (!mounted) {
    return compact ? null : <QuestsSkeleton />;
  }

  if (compact) {
    const completedCount = quests.filter(q => isQuestCompleted(q.id)).length;
    const claimedCount = quests.filter(q => isQuestClaimed(q.id)).length;

    return (
      <div className="flex items-center gap-2 text-sm">
        <Gift className="w-4 h-4 text-primary" />
        <span className="text-muted-foreground">
          Quests: {completedCount}/{quests.length}
        </span>
        {totalUnclaimed > 0 && (
          <Button size="sm" variant="ghost" onClick={handleClaimAll} className="h-6 px-2 text-xs">
            Claim +{totalUnclaimed} XP
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="w-5 h-5 text-primary" />
            Daily Quests
          </CardTitle>
          {totalUnclaimed > 0 && (
            <Button
              size="sm"
              onClick={handleClaimAll}
              disabled={claimingAll}
              className="h-7 text-xs"
            >
              {claimingAll ? 'Claiming...' : `Claim All (+${totalUnclaimed} XP)`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {quests.map((quest) => (
          <QuestItem
            key={quest.id}
            quest={quest}
            progress={getQuestProgress(quest.id)?.current || 0}
            completed={isQuestCompleted(quest.id)}
            claimed={isQuestClaimed(quest.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface QuestItemProps {
  quest: Quest;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

// Memoized to prevent re-renders when other quests update
const QuestItem = memo(function QuestItem({ quest, progress, completed, claimed }: QuestItemProps) {
  const IconComponent = ICON_MAP[quest.icon] || Star;
  const percentage = Math.min((progress / quest.target) * 100, 100);

  return (
    <div
      className={cn(
        'relative p-3 rounded-lg border transition-all',
        claimed && 'opacity-60 bg-muted/30',
        completed && !claimed && 'border-primary bg-primary/5',
        !completed && 'hover:border-border/80'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'p-2 rounded-lg',
            claimed && 'bg-muted',
            completed && !claimed && 'bg-primary/10',
            !completed && 'bg-muted'
          )}
        >
          <IconComponent
            className={cn(
              'w-4 h-4',
              claimed && 'text-muted-foreground',
              completed && !claimed && 'text-primary',
              !completed && 'text-muted-foreground'
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-sm">{quest.title}</h4>
            <span
              className={cn(
                'text-xs font-medium',
                claimed && 'text-muted-foreground line-through',
                completed && !claimed && 'text-primary',
                !completed && 'text-muted-foreground'
              )}
            >
              +{quest.reward} XP
            </span>
          </div>

          <p className="text-xs text-muted-foreground mt-0.5">
            {quest.description}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  claimed && 'bg-muted-foreground',
                  completed && !claimed && 'bg-primary',
                  !completed && 'bg-primary/60'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              {progress}/{quest.target}
            </span>
            {claimed && (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

function QuestsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="h-5 w-28 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-lg border">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                <div className="h-1.5 bg-muted rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
