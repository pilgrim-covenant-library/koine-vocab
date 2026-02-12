'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { formatMorphology } from '@/lib/morphology';
import type { VerseWord } from '@/types/homework';
import { cn } from '@/lib/utils';

interface AnnotatedVerseProps {
  words: VerseWord[];
  className?: string;
}

interface PopoverPosition {
  top: number;
  left: number;
}

/**
 * AnnotatedVerse renders Greek text with clickable words.
 * Clicking a word opens a popover showing lemma, gloss, and parsing info.
 */
export function AnnotatedVerse({ words, className }: AnnotatedVerseProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Calculate popover position when a word is clicked
  const handleWordClick = useCallback((index: number, event: React.MouseEvent<HTMLSpanElement>) => {
    if (activeIndex === index) {
      // Toggle off if clicking the same word
      setActiveIndex(null);
      return;
    }

    const target = event.currentTarget;
    const container = containerRef.current;
    if (!container) return;

    const targetRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Position popover below the word, centered horizontally
    let left = targetRect.left - containerRect.left + targetRect.width / 2;
    const top = targetRect.bottom - containerRect.top + 8; // 8px gap

    // Clamp left position to keep popover within container
    const popoverWidth = 280; // approximate max width
    const halfWidth = popoverWidth / 2;
    left = Math.max(halfWidth, Math.min(left, containerRect.width - halfWidth));

    setPopoverPosition({ top, left });
    setActiveIndex(index);
  }, [activeIndex]);

  // Close popover when clicking outside
  useEffect(() => {
    if (activeIndex === null) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActiveIndex(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveIndex(null);
      }
    };

    // Delay to prevent immediate close on the click that opened it
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activeIndex]);

  const activeWord = activeIndex !== null ? words[activeIndex] : null;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Greek text with clickable words */}
      <p className="text-2xl greek-text font-serif tracking-wide text-center leading-relaxed">
        {words.map((word, index) => (
          <span key={index}>
            <span
              onClick={(e) => handleWordClick(index, e)}
              className={cn(
                'cursor-pointer transition-colors rounded px-0.5 -mx-0.5',
                'hover:bg-primary/10 hover:text-primary',
                activeIndex === index && 'bg-primary/20 text-primary'
              )}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleWordClick(index, e as unknown as React.MouseEvent<HTMLSpanElement>);
                }
              }}
            >
              {word.surface}
            </span>
            {/* Add space between words, but not after last word */}
            {index < words.length - 1 && ' '}
          </span>
        ))}
      </p>

      {/* Popover */}
      {activeWord && (
        <div
          ref={popoverRef}
          className={cn(
            'absolute z-50 w-72 max-w-[calc(100%-1rem)]',
            'bg-popover text-popover-foreground rounded-lg shadow-lg border',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
          style={{
            top: popoverPosition.top,
            left: popoverPosition.left,
            transform: 'translateX(-50%)',
          }}
        >
          {/* Arrow pointing up */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-popover border-l border-t"
          />

          <div className="relative p-4 space-y-3">
            {/* Surface form (large) */}
            <div className="text-center">
              <span className="text-2xl greek-text font-serif">{activeWord.surface}</span>
            </div>

            {/* Lemma and gloss */}
            <div className="flex items-baseline justify-between gap-2 border-b pb-2">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Lemma</span>
                <p className="text-lg greek-text font-serif">{activeWord.lemma}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Gloss</span>
                <p className="text-sm font-medium">{activeWord.gloss}</p>
              </div>
            </div>

            {/* Parsing */}
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Parsing</span>
              <p className="text-sm font-medium mt-0.5">
                {formatMorphology(activeWord.parsing)}
              </p>
            </div>

            {/* Strong's number (optional) */}
            {activeWord.strongs && (
              <div className="text-xs text-muted-foreground text-center pt-1 border-t">
                Strong&apos;s: {activeWord.strongs}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
