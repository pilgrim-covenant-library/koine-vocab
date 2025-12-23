'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ArrowLeft,
  RotateCcw,
  ChevronRight,
  Shuffle,
  BookOpen,
  ChevronDown,
  Eye,
  EyeOff,
  Cloud,
  CloudOff,
  Loader2,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { syncProgressToCloud } from '@/lib/firebase';
import { GreekWord } from '@/components/GreekWord';
import { XPBar, XPGain } from '@/components/XPBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn, shuffle as shuffleArray } from '@/lib/utils';
import { scoreTranslation, calculateTranslationXP } from '@/lib/translation';
import ntVersesData from '@/data/nt-verses.json';
import type { NTVerse, NTBook, TranslationResult } from '@/types';

type TranslationMode = 'random' | 'sequential';

interface SessionStats {
  versesCompleted: number;
  totalScore: number;
  averageScore: number;
}

export default function TranslationPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuthStore();
  const { stats, progress, addXP } = useUserStore();

  // Mode selection state
  const [mode, setMode] = useState<TranslationMode | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [bookWarning, setBookWarning] = useState<string | null>(null);

  // Cloud sync state
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedProgressRef = useRef<string>('');

  // Debounced cloud sync for learning progress
  useEffect(() => {
    if (!user || mode === null) return;

    const currentProgressStr = JSON.stringify({ progress, stats });
    if (currentProgressStr === lastSyncedProgressRef.current) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        await syncProgressToCloud(user.uid, {
          words: progress,
          stats,
          lastSynced: new Date(),
        });
        lastSyncedProgressRef.current = currentProgressStr;
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to sync learning progress:', error);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    }, 30000);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, progress, stats, mode]);

  // Session state
  const [verses, setVerses] = useState<NTVerse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTranslation, setUserTranslation] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showReference, setShowReference] = useState(false);

  // XP state
  const [showXPGain, setShowXPGain] = useState(false);
  const [lastXP, setLastXP] = useState(0);

  // Session tracking
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    versesCompleted: 0,
    totalScore: 0,
    averageScore: 0,
  });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  const books = ntVersesData.books as NTBook[];
  const allVerses = ntVersesData.verses as NTVerse[];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus textarea when ready
  useEffect(() => {
    if (!showResult && textareaRef.current && verses.length > 0) {
      textareaRef.current.focus();
    }
  }, [showResult, currentIndex, verses.length]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showBookSelector) {
        setShowBookSelector(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showBookSelector]);

  const startRandomMode = useCallback(() => {
    const shuffled = shuffleArray([...allVerses]).slice(0, 10);
    setVerses(shuffled);
    setMode('random');
    setCurrentIndex(0);
    setUserTranslation('');
    setResult(null);
    setShowResult(false);
    setSessionStats({ versesCompleted: 0, totalScore: 0, averageScore: 0 });
  }, [allVerses]);

  const startSequentialMode = useCallback(
    (bookId: string) => {
      const bookVerses = allVerses
        .filter((v) => v.book === bookId)
        .sort((a, b) => {
          if (a.chapter !== b.chapter) return a.chapter - b.chapter;
          return a.verse - b.verse;
        });

      if (bookVerses.length === 0) {
        // No verses for this book yet, show warning message
        setBookWarning('No verses available for this book yet. Try another book or random mode.');
        setTimeout(() => setBookWarning(null), 4000); // Auto-dismiss after 4 seconds
        return;
      }

      setVerses(bookVerses);
      setSelectedBook(bookId);
      setMode('sequential');
      setCurrentIndex(0);
      setUserTranslation('');
      setResult(null);
      setShowResult(false);
      setShowBookSelector(false);
      setSessionStats({ versesCompleted: 0, totalScore: 0, averageScore: 0 });
    },
    [allVerses]
  );

  const currentVerse = verses[currentIndex];

  const handleSubmit = useCallback(() => {
    if (!currentVerse || showResult) return;

    const translationResult = scoreTranslation(currentVerse, userTranslation);
    setResult(translationResult);
    setShowResult(true);

    // Calculate and award XP
    const xpEarned = calculateTranslationXP(translationResult.score, currentVerse.difficulty);
    if (xpEarned > 0) {
      addXP(xpEarned);
      setLastXP(xpEarned);
      setShowXPGain(true);
    }

    // Update session stats
    setSessionStats((prev) => {
      const newCompleted = prev.versesCompleted + 1;
      const newTotal = prev.totalScore + translationResult.score;
      return {
        versesCompleted: newCompleted,
        totalScore: newTotal,
        averageScore: Math.round((newTotal / newCompleted) * 10) / 10,
      };
    });
  }, [currentVerse, showResult, userTranslation, addXP]);

  const handleNext = useCallback(() => {
    if (currentIndex < verses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserTranslation('');
      setResult(null);
      setShowResult(false);
      setShowReference(false);
    } else {
      setSessionComplete(true);
    }
  }, [currentIndex, verses.length]);

  const handleEndSession = async () => {
    // Final sync to cloud before exiting
    if (user && sessionStats.versesCompleted > 0) {
      try {
        setSyncStatus('syncing');
        await syncProgressToCloud(user.uid, {
          words: progress,
          stats,
          lastSynced: new Date(),
        });
        setSyncStatus('synced');
      } catch (error) {
        console.error('Failed final sync on session end:', error);
        setSyncStatus('error');
      }
    }

    setMode(null);
    setVerses([]);
    setCurrentIndex(0);
    setSessionComplete(false);
    router.push('/');
  };

  const handleRestart = () => {
    setSessionComplete(false);
    if (mode === 'random') {
      startRandomMode();
    } else if (mode === 'sequential' && selectedBook) {
      startSequentialMode(selectedBook);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      if (!showResult) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  if (!mounted) {
    return <LoadingSkeleton />;
  }

  // Mode selection screen
  if (mode === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="font-bold">Translation Practice</h1>
              <div className="w-10" />
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Choose Practice Mode</h2>
              <p className="text-muted-foreground">
                Practice translating Greek verses from the New Testament
              </p>
            </div>

            {/* Random Mode */}
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={startRandomMode}
            >
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                    <Shuffle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Random Verses</h3>
                    <p className="text-sm text-muted-foreground">
                      Practice with random verses from across the NT
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Sequential Mode */}
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setShowBookSelector(true)}
            >
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Read Through a Book</h3>
                    <p className="text-sm text-muted-foreground">
                      Translate verses in order through a NT book
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Book selector modal */}
            {showBookSelector && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">Select a Book</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowBookSelector(false)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    {bookWarning && (
                      <div className="mb-4 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm">
                        {bookWarning}
                      </div>
                    )}
                    <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                      {books.map((book) => {
                        const verseCount = allVerses.filter((v) => v.book === book.id).length;
                        return (
                          <button
                            key={book.id}
                            className={cn(
                              'w-full text-left px-4 py-3 rounded-lg transition-colors',
                              'hover:bg-muted',
                              verseCount === 0 && 'opacity-50 cursor-not-allowed'
                            )}
                            onClick={() => verseCount > 0 && startSequentialMode(book.id)}
                            disabled={verseCount === 0}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{book.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {verseCount > 0 ? `${verseCount} verses` : 'Coming soon'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Session complete screen
  if (sessionComplete) {
    const emoji =
      sessionStats.averageScore >= 8 ? '🏆' : sessionStats.averageScore >= 6 ? '👏' : '💪';
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center">
            <div className="text-6xl mb-4">{emoji}</div>
            <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-lg">
                <span className="font-bold text-primary">{sessionStats.versesCompleted}</span>
                <span className="text-muted-foreground"> verses translated</span>
              </p>
              <p className="text-3xl font-bold text-amber-500">
                {sessionStats.averageScore}/10 average
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRestart} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Practice More
              </Button>
              <Button onClick={handleEndSession} className="flex-1">
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main translation UI
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleEndSession}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              {/* Sync status indicator */}
              {user && syncStatus !== 'idle' && (
                <div className="flex items-center gap-1" title={
                  syncStatus === 'syncing' ? 'Saving to cloud...' :
                  syncStatus === 'synced' ? 'Saved to cloud' :
                  'Sync failed - data saved locally'
                }>
                  {syncStatus === 'syncing' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                  {syncStatus === 'synced' && <Cloud className="w-3.5 h-3.5 text-green-500" />}
                  {syncStatus === 'error' && <CloudOff className="w-3.5 h-3.5 text-orange-500" />}
                </div>
              )}
            </div>
            <span className="text-sm font-medium">
              {currentIndex + 1} / {verses.length}
            </span>
            <Button variant="ghost" size="icon" onClick={handleEndSession}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / verses.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start p-4">
        {/* XP indicator */}
        <div className="relative mb-4 w-full max-w-2xl">
          <XPBar xp={stats.xp} level={stats.level} showDetails={false} />
          <XPGain amount={lastXP} show={showXPGain} onComplete={() => setShowXPGain(false)} />
        </div>

        {/* Verse card */}
        {currentVerse && (
          <Card className="w-full max-w-2xl mb-4">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  {currentVerse.reference}
                </span>
                <span
                  className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    currentVerse.difficulty === 1 &&
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
                    currentVerse.difficulty === 2 &&
                      'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                    currentVerse.difficulty === 3 &&
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  )}
                >
                  {currentVerse.difficulty === 1
                    ? 'Easy'
                    : currentVerse.difficulty === 2
                    ? 'Medium'
                    : 'Hard'}
                </span>
              </div>

              {/* Greek text */}
              <div className="text-center mb-4">
                <p className="text-2xl font-greek leading-relaxed mb-2">{currentVerse.greek}</p>
                <p className="text-sm text-muted-foreground italic">
                  {currentVerse.transliteration}
                </p>
              </div>

              {/* Notes */}
              {currentVerse.notes && (
                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mt-4">
                  💡 {currentVerse.notes}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Translation input */}
        {currentVerse && !showResult && (
          <div className="w-full max-w-2xl mb-4">
            <textarea
              ref={textareaRef}
              value={userTranslation}
              onChange={(e) => setUserTranslation(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your English translation..."
              className={cn(
                'w-full min-h-[120px] p-4 rounded-xl border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary',
                'resize-none'
              )}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Ctrl+Enter to submit
            </p>
          </div>
        )}

        {/* Result display */}
        {showResult && result && currentVerse && (
          <div className="w-full max-w-2xl space-y-4 mb-4">
            {/* Score */}
            <Card
              className={cn(
                result.score >= 7
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                  : result.score >= 4
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950'
                  : 'border-red-500 bg-red-50 dark:bg-red-950'
              )}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{result.feedback}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.suggestions.length > 0 && result.suggestions[0]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-4xl font-bold',
                        result.score >= 7
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : result.score >= 4
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {result.score}
                    </p>
                    <p className="text-sm text-muted-foreground">out of 10</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User's translation */}
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-sm font-medium text-muted-foreground mb-2">Your translation:</p>
              <p className="text-base">{userTranslation}</p>
            </div>

            {/* Key terms */}
            <div className="flex flex-wrap gap-2">
              {result.keyTermsFound.map((term) => (
                <span
                  key={term}
                  className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                >
                  ✓ {term}
                </span>
              ))}
              {result.keyTermsMissed.map((term) => (
                <span
                  key={term}
                  className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                >
                  ✗ {term}
                </span>
              ))}
            </div>

            {/* Reference translation toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReference(!showReference)}
              className="w-full"
            >
              {showReference ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Reference Translation
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Reference Translation
                </>
              )}
            </Button>

            {/* Reference translation */}
            {showReference && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Reference translation:
                </p>
                <p className="text-base text-blue-900 dark:text-blue-100">
                  {currentVerse.referenceTranslation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action button */}
        <div className="w-full max-w-2xl">
          {!showResult ? (
            <Button
              size="lg"
              className="w-full"
              disabled={!userTranslation.trim()}
              onClick={handleSubmit}
            >
              Check Translation
            </Button>
          ) : (
            <Button size="lg" className="w-full" onClick={handleNext}>
              {currentIndex < verses.length - 1 ? (
                <>
                  Next Verse
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                'See Results'
              )}
            </Button>
          )}
        </div>
      </main>

      {/* Session stats footer */}
      <footer className="border-t bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="font-bold text-amber-500">{sessionStats.versesCompleted}</div>
              <div className="text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{sessionStats.averageScore || '-'}</div>
              <div className="text-muted-foreground">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-500">+{lastXP}</div>
              <div className="text-muted-foreground">Last XP</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      <header className="border-b p-4">
        <div className="h-8 bg-muted rounded" />
      </header>
      <main className="flex-1 flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-2xl h-48 bg-muted rounded-2xl mb-6" />
        <div className="w-full max-w-2xl h-32 bg-muted rounded-xl mb-4" />
        <div className="w-full max-w-2xl h-12 bg-muted rounded-lg" />
      </main>
    </div>
  );
}
