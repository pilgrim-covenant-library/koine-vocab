'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface DailyStudy {
  reviews: number;
  wordsLearned: number;
}

interface StudyHeatmapProps {
  studyHistory: Record<string, DailyStudy>;
  className?: string;
}

// Get local date string in YYYY-MM-DD format
function getLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Generate dates for the last N days (using local timezone)
function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(getLocalDateString(date));
  }

  return dates;
}

// Get the intensity level (0-4) based on review count
function getIntensityLevel(reviews: number): number {
  if (reviews === 0) return 0;
  if (reviews <= 5) return 1;
  if (reviews <= 15) return 2;
  if (reviews <= 30) return 3;
  return 4;
}

export function StudyHeatmap({ studyHistory, className }: StudyHeatmapProps) {
  const days = useMemo(() => getLastNDays(84), []); // 12 weeks = 84 days

  // Group days into weeks (starting from Sunday)
  const weeks = useMemo(() => {
    const result: string[][] = [];
    let currentWeek: string[] = [];

    // Find the day of week for the first day
    const firstDate = new Date(days[0]);
    const firstDayOfWeek = firstDate.getDay();

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push('');
    }

    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add remaining days
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [days]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalReviews = 0;
    let daysActive = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    const today = getLocalDateString(new Date());

    // Check from most recent to oldest for current streak
    for (let i = days.length - 1; i >= 0; i--) {
      const day = days[i];
      const data = studyHistory[day];

      if (data && data.reviews > 0) {
        totalReviews += data.reviews;
        daysActive++;
        tempStreak++;

        // Only count as current streak if it includes today or yesterday
        const dayDate = new Date(day);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 1 && currentStreak === 0) {
          currentStreak = tempStreak;
        }
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 0;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);

    return { totalReviews, daysActive, currentStreak, maxStreak };
  }, [days, studyHistory]);

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; index: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const validDays = week.filter(d => d);
      if (validDays.length > 0) {
        const date = new Date(validDays[0]);
        const month = date.getMonth();
        if (month !== lastMonth) {
          labels.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            index: weekIndex,
          });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [weeks]);

  const intensityColors = [
    'bg-muted', // 0 - no activity
    'bg-emerald-200 dark:bg-emerald-900', // 1 - low
    'bg-emerald-300 dark:bg-emerald-700', // 2 - medium
    'bg-emerald-400 dark:bg-emerald-600', // 3 - high
    'bg-emerald-500 dark:bg-emerald-500', // 4 - very high
  ];

  return (
    <div className={cn('', className)}>
      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-center text-sm">
        <div>
          <div className="font-bold text-lg">{stats.totalReviews}</div>
          <div className="text-xs text-muted-foreground">Reviews</div>
        </div>
        <div>
          <div className="font-bold text-lg">{stats.daysActive}</div>
          <div className="text-xs text-muted-foreground">Days Active</div>
        </div>
        <div>
          <div className="font-bold text-lg text-orange-500">{stats.currentStreak}</div>
          <div className="text-xs text-muted-foreground">Current</div>
        </div>
        <div>
          <div className="font-bold text-lg">{stats.maxStreak}</div>
          <div className="text-xs text-muted-foreground">Best</div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[300px]">
          {/* Month labels */}
          <div className="flex mb-1 text-xs text-muted-foreground">
            <div className="w-4" /> {/* Spacer for day labels */}
            <div className="flex-1 flex">
              {monthLabels.map(({ month, index }) => (
                <div
                  key={`${month}-${index}`}
                  className="text-left"
                  style={{
                    marginLeft: index === 0 ? 0 : `${(index - (monthLabels[monthLabels.indexOf({ month, index }) - 1]?.index || 0)) * 12 - 12}px`,
                  }}
                >
                  {month}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-0.5">
            {/* Day of week labels */}
            <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground pr-1">
              {dayLabels.map((label, i) => (
                <div key={i} className="h-[10px] flex items-center justify-center w-3">
                  {i % 2 === 1 ? label : ''}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-0.5">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {week.map((day, dayIndex) => {
                    if (!day) {
                      return <div key={dayIndex} className="w-[10px] h-[10px]" />;
                    }

                    const data = studyHistory[day];
                    const reviews = data?.reviews || 0;
                    const intensity = getIntensityLevel(reviews);
                    const date = new Date(day);
                    const isToday = day === getLocalDateString(new Date());

                    return (
                      <div
                        key={day}
                        className={cn(
                          'w-[10px] h-[10px] rounded-sm transition-colors',
                          intensityColors[intensity],
                          isToday && 'ring-1 ring-primary ring-offset-1'
                        )}
                        title={`${date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}: ${reviews} review${reviews !== 1 ? 's' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
            <span>Less</span>
            {intensityColors.map((color, i) => (
              <div
                key={i}
                className={cn('w-[10px] h-[10px] rounded-sm', color)}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
