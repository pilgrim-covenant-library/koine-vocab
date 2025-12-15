'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GreekWord } from './GreekWord';
import type { VocabularyWord } from '@/types';

interface FlashCardProps {
  word: VocabularyWord;
  isFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
}

export function FlashCard({
  word,
  isFlipped = false,
  onFlip,
  className,
}: FlashCardProps) {
  const [localFlipped, setLocalFlipped] = useState(false);
  const flipped = isFlipped !== undefined ? isFlipped : localFlipped;

  const handleClick = () => {
    if (onFlip) {
      onFlip();
    } else {
      setLocalFlipped(!localFlipped);
    }
  };

  return (
    <div
      className={cn(
        'flip-card w-full max-w-md h-72 cursor-pointer',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={flipped ? 'Show Greek word' : 'Show definition'}
    >
      <div className={cn('flip-card-inner h-full', flipped && 'flipped')}>
        {/* Front - Greek Word */}
        <div className="flip-card-front">
          <div
            className={cn(
              'h-full rounded-2xl border-2 bg-card shadow-lg',
              'flex flex-col items-center justify-center p-8',
              'transition-shadow hover:shadow-xl'
            )}
          >
            <GreekWord
              greek={word.greek}
              transliteration={word.transliteration}
              size="xl"
              showAudio
            />
            <div className="mt-4 flex items-center gap-2">
              <span
                className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  word.tier === 1 && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
                  word.tier === 2 && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                  word.tier === 3 && 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                  word.tier === 4 && 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                  word.tier === 5 && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                )}
              >
                Tier {word.tier}
              </span>
              <span className="text-xs text-muted-foreground">
                {word.partOfSpeech}
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Tap to reveal
            </p>
          </div>
        </div>

        {/* Back - Definition */}
        <div className="flip-card-back">
          <div
            className={cn(
              'h-full rounded-2xl border-2 bg-card shadow-lg',
              'flex flex-col items-center justify-center p-8',
              'transition-shadow hover:shadow-xl'
            )}
          >
            <div className="text-center space-y-4">
              <p className="text-3xl font-bold text-primary">{word.gloss}</p>
              <p className="text-base text-muted-foreground max-w-xs">
                {word.definition}
              </p>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Strong&apos;s:</span> {word.strongs}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Frequency:</span> {word.frequency}x in NT
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Tap to flip back
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
