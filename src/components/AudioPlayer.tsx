'use client';

import { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  initializeErasmianSpeech,
  speakErasmian,
  stopErasmianSpeech,
  getBestPronunciation,
  getPronunciationBreakdown,
  type PronunciationBreakdown,
} from '@/lib/erasmian';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  greek: string;
  size?: 'sm' | 'md' | 'lg';
  showPronunciation?: boolean;
  autoPlay?: boolean;
  className?: string;
}

export function AudioPlayer({
  greek,
  size = 'md',
  showPronunciation = false,
  autoPlay = false,
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<PronunciationBreakdown | null>(null);

  useEffect(() => {
    initializeErasmianSpeech().then(setIsAvailable);
    if (showPronunciation) {
      setBreakdown(getPronunciationBreakdown(greek));
    }
  }, [greek, showPronunciation]);

  useEffect(() => {
    if (autoPlay && isAvailable && greek) {
      playAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, isAvailable]);

  const playAudio = useCallback(async () => {
    if (isPlaying || !isAvailable) return;

    setIsPlaying(true);
    setError(null);

    try {
      await speakErasmian(greek);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play audio');
    } finally {
      setIsPlaying(false);
    }
  }, [greek, isPlaying, isAvailable]);

  const stopAudio = useCallback(() => {
    stopErasmianSpeech();
    setIsPlaying(false);
  }, []);

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const buttonSize = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size];

  if (!isAvailable) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(buttonSize, 'rounded-full')}
        onClick={isPlaying ? stopAudio : playAudio}
        disabled={!isAvailable}
        title={isPlaying ? 'Stop' : 'Play pronunciation'}
      >
        {isPlaying ? (
          <Loader2 className={cn(iconSize, 'animate-spin')} />
        ) : (
          <Volume2 className={iconSize} />
        )}
      </Button>

      {showPronunciation && breakdown && (
        <div className="text-sm">
          <span className="text-muted-foreground font-mono">
            [{breakdown.respelling}]
          </span>
        </div>
      )}

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}

interface PronunciationGuideProps {
  greek: string;
  showIPA?: boolean;
  showSyllables?: boolean;
  className?: string;
}

export function PronunciationGuide({
  greek,
  showIPA = false,
  showSyllables = true,
  className,
}: PronunciationGuideProps) {
  const breakdown = getPronunciationBreakdown(greek);
  const respelling = getBestPronunciation(greek);

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-2">
        <span className="text-lg font-medium">{greek}</span>
        <AudioPlayer greek={greek} size="sm" />
      </div>

      <div className="text-sm text-muted-foreground">
        <span className="font-mono">[{respelling}]</span>
        {showIPA && (
          <span className="ml-2 opacity-70">/{breakdown.ipa}/</span>
        )}
      </div>

      {showSyllables && breakdown.syllables.length > 1 && (
        <div className="flex gap-1 text-xs">
          {breakdown.syllables.map((syllable, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-muted rounded font-mono"
            >
              {syllable}
              <span className="text-muted-foreground ml-1">
                ({breakdown.syllableRespellings[i]})
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface AudioButtonProps {
  greek: string;
  disabled?: boolean;
  className?: string;
}

export function AudioButton({ greek, disabled, className }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    initializeErasmianSpeech().then(setIsAvailable);
  }, []);

  const handleClick = async () => {
    if (isPlaying || !isAvailable || disabled) return;

    setIsPlaying(true);
    try {
      await speakErasmian(greek);
    } finally {
      setIsPlaying(false);
    }
  };

  if (!isAvailable) return null;

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isPlaying}
      className={cn(
        'p-2 rounded-full transition-colors',
        'hover:bg-muted disabled:opacity-50',
        className
      )}
      title="Play pronunciation"
    >
      {isPlaying ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </button>
  );
}
