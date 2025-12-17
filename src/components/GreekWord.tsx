'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { speakGreek, initializeSpeech, isSpeechAvailable } from '@/lib/audio';

interface GreekWordProps {
  greek: string;
  transliteration?: string;
  showTransliteration?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showAudio?: boolean;
}

const sizeClasses = {
  sm: 'text-base sm:text-lg',
  md: 'text-xl sm:text-2xl',
  lg: 'text-3xl sm:text-4xl',
  xl: 'text-4xl sm:text-5xl',
};

export function GreekWord({
  greek,
  transliteration,
  showTransliteration = true,
  size = 'lg',
  className,
  showAudio = true,
}: GreekWordProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);

  useEffect(() => {
    if (showAudio && isSpeechAvailable()) {
      initializeSpeech().then(setAudioAvailable);
    }
  }, [showAudio]);

  const handleSpeak = async () => {
    if (!audioAvailable || isPlaying) return;

    setIsPlaying(true);
    try {
      await speakGreek(greek);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'greek-text font-serif tracking-wide',
            sizeClasses[size]
          )}
        >
          {greek}
        </span>
        {showAudio && (
          audioAvailable ? (
            <button
              onClick={handleSpeak}
              disabled={isPlaying}
              className={cn(
                'p-2 rounded-full transition-colors',
                'hover:bg-muted active:bg-muted/80',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Play pronunciation"
            >
              {isPlaying ? (
                <VolumeX className="w-5 h-5 text-muted-foreground animate-pulse" />
              ) : (
                <Volume2 className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              )}
            </button>
          ) : (
            <span
              className="p-2 rounded-full text-muted-foreground/40"
              title="Audio not available - check browser settings"
              aria-label="Audio unavailable"
            >
              <VolumeX className="w-5 h-5" />
            </span>
          )
        )}
      </div>
      {showTransliteration && transliteration && (
        <span className="text-sm text-muted-foreground italic">
          {transliteration}
        </span>
      )}
    </div>
  );
}
