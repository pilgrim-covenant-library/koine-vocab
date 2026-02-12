'use client';

import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, AlertCircle, BookOpen, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHomeworkStore } from '@/stores/homeworkStore';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/stores/authStore';
import { FloatingHelpButton } from '@/components/homework/HelpButton';
import { HomeworkProgressCompact } from '@/components/homework/HomeworkProgress';
import { SectionNavigation, QuestionProgressBar } from '@/components/homework/SectionNavigation';
import { AnnotatedVerse } from '@/components/homework/AnnotatedVerse';
import { getQuestionsForHW4Section, type HW4SectionId } from '@/data/homework/hw4-questions';
import { HW4_SECTION_META, type MCQQuestion, type TranslationQuestion } from '@/types/homework';
import { scoreTranslation } from '@/lib/translation';
import type { TranslationResult } from '@/types';
import { cn } from '@/lib/utils';

// Static sections array - avoid recreating on every render
const SECTION_IDS: HW4SectionId[] = [1, 2, 3, 4, 5, 6];

// Memoized MCQ Option Button to prevent unnecessary re-renders
interface MCQOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  showFeedback: boolean;
  isCorrectOption: boolean;
  onSelect: (index: number) => void;
}

const MCQOption = memo(function MCQOption({
  option,
  index,
  isSelected,
  showFeedback,
  isCorrectOption,
  onSelect,
}: MCQOptionProps) {
  return (
    <button
      onClick={() => onSelect(index)}
      disabled={showFeedback}
      className={cn(
        'w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-all',
        'hover:border-primary hover:bg-primary/5',
        'disabled:hover:border-border disabled:hover:bg-transparent',
        isSelected && !showFeedback && 'border-primary bg-primary/10',
        showFeedback && isCorrectOption && 'border-green-500 bg-green-100 dark:bg-green-900/30',
        showFeedback && isSelected && !isCorrectOption && 'border-red-500 bg-red-100 dark:bg-red-900/30',
        showFeedback && !isSelected && !isCorrectOption && 'opacity-50'
      )}
    >
      <span
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium',
          'border-2',
          isSelected && !showFeedback && 'border-primary bg-primary text-primary-foreground',
          !isSelected && !showFeedback && 'border-muted-foreground/30',
          showFeedback && isCorrectOption && 'border-green-500 bg-green-500 text-white',
          showFeedback && isSelected && !isCorrectOption && 'border-red-500 bg-red-500 text-white'
        )}
      >
        {showFeedback && isCorrectOption ? (
          <Check className="w-4 h-4" />
        ) : showFeedback && isSelected && !isCorrectOption ? (
          <X className="w-4 h-4" />
        ) : (
          index + 1
        )}
      </span>
      <span className="flex-1">{option}</span>
    </button>
  );
});

export default function HW4SectionPage() {
  const router = useRouter();
  const params = useParams();
  const parsedId = parseInt(params.id as string, 10);

  // Validate section ID is 1-6
  const isValidSectionId = !isNaN(parsedId) && parsedId >= 1 && parsedId <= 6;
  const sectionId = (isValidSectionId ? parsedId : 1) as HW4SectionId;

  const { user } = useAuthStore();

  // Use targeted selectors to prevent over-subscription
  // Defensive: fallback if section data is missing (e.g. stale cloud data)
  const sectionProgress = useHomeworkStore(
    useShallow((state) => state.homework4.sections[sectionId] ?? {
      status: 'not_started' as const,
      currentIndex: 0,
      answers: [],
      score: 0,
      totalQuestions: 0,
    })
  );
  const sectionStatuses = useHomeworkStore(
    useShallow((state) =>
      Object.fromEntries(
        SECTION_IDS.map((id) => [id, state.homework4.sections[id]?.status ?? 'not_started'])
      ) as Record<HW4SectionId, 'not_started' | 'in_progress' | 'completed'>
    )
  );

  // Actions don't cause re-renders - select individually
  const startSection4 = useHomeworkStore((state) => state.startSection4);
  const submitAnswer4 = useHomeworkStore((state) => state.submitAnswer4);
  const nextQuestion4 = useHomeworkStore((state) => state.nextQuestion4);
  const previousQuestion4 = useHomeworkStore((state) => state.previousQuestion4);
  const completeSection4 = useHomeworkStore((state) => state.completeSection4);
  const completeHomework4 = useHomeworkStore((state) => state.completeHomework4);
  const syncToCloud4 = useHomeworkStore((state) => state.syncToCloud4);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Translation-specific state
  const [translationInput, setTranslationInput] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [showReference, setShowReference] = useState(false);

  // Memoize questions to avoid recalculation
  const questions = useMemo(() => getQuestionsForHW4Section(sectionId), [sectionId]);
  const currentQuestion = questions[sectionProgress.currentIndex];
  const meta = HW4_SECTION_META[sectionId];

  // Memoize existing answer lookup
  const existingAnswer = useMemo(() => {
    if (!currentQuestion) return undefined;
    return sectionProgress.answers.find(a => a.questionId === currentQuestion.id);
  }, [sectionProgress.answers, currentQuestion]);

  // Debounced sync to cloud - batches rapid answers (1 second delay)
  const debouncedSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(async () => {
      if (user) {
        try {
          await syncToCloud4(user.uid);
        } catch (error) {
          console.error('Failed to sync homework to cloud:', error);
        }
      }
    }, 1000);
  }, [user, syncToCloud4]);

  // Validate section ID and start section
  useEffect(() => {
    if (!isValidSectionId) {
      console.warn(`Invalid section ID: ${params.id}`);
      router.replace('/homework/hw4');
      return;
    }
    startSection4(sectionId);
  }, [sectionId, isValidSectionId, params.id, startSection4, router]);

  // Sync on tab close/navigation - flush any pending debounced sync
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (user) {
        syncToCloud4(user.uid);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, syncToCloud4]);

  // Reset input when question changes
  useEffect(() => {
    if (existingAnswer) {
      setShowFeedback(true);
      setIsCorrect(existingAnswer.isCorrect);
      if (currentQuestion?.type === 'translation') {
        setTranslationInput(existingAnswer.userAnswer as string);
      } else {
        setSelectedOption(existingAnswer.userAnswer as number);
      }
    } else {
      setShowFeedback(false);
      setIsCorrect(false);
      setSelectedOption(null);
      setTranslationInput('');
      setTranslationResult(null);
      setShowReference(false);
    }
  }, [sectionProgress.currentIndex, existingAnswer, currentQuestion?.type]);

  // Handle answer submission (MCQ)
  const handleSubmit = useCallback(() => {
    if (!currentQuestion || currentQuestion.type !== 'mcq' || selectedOption === null) return;

    const correct = selectedOption === currentQuestion.correctIndex;
    submitAnswer4(sectionId, currentQuestion.id, selectedOption, correct);

    setIsCorrect(correct);
    setShowFeedback(true);

    debouncedSync();
  }, [currentQuestion, selectedOption, sectionId, submitAnswer4, debouncedSync]);

  // Handle translation submission
  const handleTranslationSubmit = useCallback(() => {
    if (!currentQuestion || currentQuestion.type !== 'translation' || !translationInput.trim()) return;

    // scoreTranslation expects an NTVerse-shaped object
    const verseObj = {
      id: currentQuestion.id,
      book: 'Mark',
      chapter: 0,
      verse: 0,
      reference: currentQuestion.reference,
      greek: currentQuestion.greek,
      transliteration: currentQuestion.transliteration,
      referenceTranslation: currentQuestion.referenceTranslation,
      keyTerms: currentQuestion.keyTerms,
      difficulty: currentQuestion.difficulty,
      notes: currentQuestion.notes,
    };

    const result = scoreTranslation(verseObj, translationInput);
    setTranslationResult(result);

    const correct = result.score >= 4;
    submitAnswer4(sectionId, currentQuestion.id, translationInput, correct);

    setIsCorrect(correct);
    setShowFeedback(true);

    debouncedSync();
  }, [currentQuestion, translationInput, sectionId, submitAnswer4, debouncedSync]);

  // Handle next question
  const handleNext = () => {
    if (!nextQuestion4(sectionId)) {
      // Last question
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    previousQuestion4(sectionId);
  };

  // Handle section completion
  const handleComplete = async () => {
    completeSection4(sectionId);

    // Immediate sync on section complete
    if (user) {
      await syncToCloud4(user.uid);
    }

    if (sectionId === 6) {
      completeHomework4();
      router.push('/homework/hw4/complete');
    } else {
      router.push(`/homework/hw4/section/${sectionId + 1}`);
    }
  };

  // Use ref to store handleSubmit to avoid re-attaching listener on every render
  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  // Keyboard shortcuts for MCQ - stabilized with refs (only for MCQ sections)
  useEffect(() => {
    if (!currentQuestion || showFeedback || currentQuestion.type === 'translation') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        setSelectedOption(parseInt(key, 10) - 1);
      } else if (key === 'Enter' && selectedOption !== null) {
        handleSubmitRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, showFeedback, selectedOption]);

  // Memoized handler for MCQ option selection
  const handleSelectOption = useCallback((index: number) => {
    if (!showFeedback) setSelectedOption(index);
  }, [showFeedback]);

  if (!currentQuestion) {
    return null;
  }

  const isLastQuestion = sectionProgress.currentIndex === questions.length - 1;
  const isLastSection = sectionId === 6;
  const hasAnswered = showFeedback || existingAnswer !== undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/homework/hw4"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Overview</span>
          </Link>
          <div className="flex items-center gap-4">
            <HomeworkProgressCompact
              currentSection={sectionId}
              sectionStatuses={sectionStatuses}
              sectionMeta={HW4_SECTION_META}
              sectionIds={SECTION_IDS}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          {/* Section title */}
          <div>
            <p className="text-sm text-muted-foreground">Section {sectionId}</p>
            <h1 className="text-2xl font-bold">{meta.title}</h1>
          </div>

          {/* Progress bar */}
          <QuestionProgressBar
            current={sectionProgress.currentIndex}
            total={questions.length}
            answered={sectionProgress.answers.length}
          />

          {/* Question card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {sectionProgress.currentIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentQuestion.type === 'translation' ? (
                /* ─── Translation question UI ─── */
                <>
                  {/* Reference label + difficulty badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {currentQuestion.reference}
                      </span>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      currentQuestion.difficulty === 1 && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                      currentQuestion.difficulty === 2 && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
                      currentQuestion.difficulty === 3 && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                    )}>
                      {currentQuestion.difficulty === 1 ? 'Basic' : currentQuestion.difficulty === 2 ? 'Intermediate' : 'Advanced'}
                    </span>
                  </div>

                  {/* Greek text - clickable if word annotations available */}
                  {currentQuestion.words ? (
                    <div className="space-y-1">
                      <AnnotatedVerse words={currentQuestion.words} />
                      <p className="text-xs text-muted-foreground text-center">
                        Click any word for parsing info
                      </p>
                    </div>
                  ) : (
                    <p className="text-2xl greek-text font-serif tracking-wide text-center leading-relaxed">
                      {currentQuestion.greek}
                    </p>
                  )}

                  {/* Transliteration */}
                  <p className="text-sm text-muted-foreground text-center italic">
                    {currentQuestion.transliteration}
                  </p>

                  {/* Grammar notes */}
                  {currentQuestion.notes && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
                      {currentQuestion.notes}
                    </p>
                  )}

                  {/* Vocab help */}
                  {currentQuestion.vocabHelp && (
                    <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                      <span className="font-medium">Vocab: </span>
                      {currentQuestion.vocabHelp}
                    </div>
                  )}

                  {/* Translation textarea */}
                  {!showFeedback && (
                    <div className="space-y-2">
                      <textarea
                        value={translationInput}
                        onChange={(e) => setTranslationInput(e.target.value)}
                        placeholder="Translate this verse in your own words..."
                        rows={3}
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      />
                      <Button
                        onClick={handleTranslationSubmit}
                        disabled={!translationInput.trim()}
                        className="w-full"
                      >
                        Check Translation
                      </Button>
                    </div>
                  )}

                  {/* Translation feedback */}
                  {showFeedback && translationResult && (
                    <div className="space-y-4">
                      {/* Score card */}
                      <div className={cn(
                        'rounded-lg p-4 text-center',
                        translationResult.score >= 7 ? 'bg-green-100 dark:bg-green-900/30' :
                        translationResult.score >= 5 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-red-100 dark:bg-red-900/30'
                      )}>
                        <p className={cn(
                          'text-3xl font-bold',
                          translationResult.score >= 7 ? 'text-green-600 dark:text-green-400' :
                          translationResult.score >= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        )}>
                          {translationResult.score}/10
                        </p>
                        <p className="text-sm mt-1">{translationResult.feedback}</p>
                      </div>

                      {/* Your translation */}
                      <div className="text-sm">
                        <p className="font-medium mb-1">Your translation:</p>
                        <p className="text-muted-foreground italic">{translationInput}</p>
                      </div>

                      {/* Key terms found/missed */}
                      {(translationResult.keyTermsFound.length > 0 || translationResult.keyTermsMissed.length > 0) && (
                        <div className="text-sm space-y-2">
                          {translationResult.keyTermsFound.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              <span className="font-medium text-green-600 dark:text-green-400">Found:</span>
                              {translationResult.keyTermsFound.map((term) => (
                                <span key={term} className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs">
                                  {term}
                                </span>
                              ))}
                            </div>
                          )}
                          {translationResult.keyTermsMissed.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              <span className="font-medium text-amber-600 dark:text-amber-400">Missed:</span>
                              {translationResult.keyTermsMissed.map((term) => (
                                <span key={term} className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">
                                  {term}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Suggestions */}
                      {translationResult.suggestions.length > 0 && (
                        <div className="text-sm">
                          <p className="font-medium mb-1">Suggestions:</p>
                          <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                            {translationResult.suggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Reveal reference translation toggle */}
                      <button
                        onClick={() => setShowReference(!showReference)}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        {showReference ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showReference ? 'Hide' : 'Reveal'} Reference Translation
                      </button>
                      {showReference && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                          <p className="font-medium text-muted-foreground">{currentQuestion.referenceTranslation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show previous feedback for already-answered translation */}
                  {showFeedback && !translationResult && existingAnswer && (
                    <div className={cn(
                      'flex items-start gap-3 p-4 rounded-lg',
                      isCorrect
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                    )}>
                      {isCorrect ? (
                        <Check className="w-5 h-5 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">
                          {isCorrect ? 'Good translation!' : 'Needs improvement'}
                        </p>
                        <p className="text-sm mt-1 italic">
                          Your answer: {existingAnswer.userAnswer as string}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* ─── MCQ question UI ─── */
                <>
                  <div className="space-y-2">
                    {(currentQuestion as MCQQuestion).greek && (
                      <p className="text-3xl greek-text font-serif tracking-wide text-center mb-4">
                        {(currentQuestion as MCQQuestion).greek}
                      </p>
                    )}
                    {(currentQuestion as MCQQuestion).vocabHelp && (
                      <p className="text-sm text-muted-foreground text-center mb-4 italic">
                        {(currentQuestion as MCQQuestion).vocabHelp}
                      </p>
                    )}
                    <p className="text-lg font-medium">
                      {(currentQuestion as MCQQuestion).question}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(currentQuestion as MCQQuestion).options.map((option, index) => (
                      <MCQOption
                        key={index}
                        option={option}
                        index={index}
                        isSelected={selectedOption === index}
                        showFeedback={showFeedback}
                        isCorrectOption={index === (currentQuestion as MCQQuestion).correctIndex}
                        onSelect={handleSelectOption}
                      />
                    ))}
                  </div>

                  {/* Keyboard hint */}
                  {!showFeedback && (
                    <p className="text-xs text-muted-foreground text-center">
                      Press 1-4 to select, Enter to submit
                    </p>
                  )}

                  {/* Feedback */}
                  {showFeedback && (
                    <div
                      className={cn(
                        'flex items-start gap-3 p-4 rounded-lg',
                        isCorrect
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                      )}
                    >
                      {isCorrect ? (
                        <Check className="w-5 h-5 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">
                          {isCorrect ? 'Correct!' : 'Review this concept'}
                        </p>
                        <p className="text-sm mt-1">
                          {(currentQuestion as MCQQuestion).explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Submit button (only show if not yet answered) */}
                  {!showFeedback && (
                    <Button
                      onClick={handleSubmit}
                      disabled={selectedOption === null}
                      className="w-full"
                    >
                      Check Answer
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <SectionNavigation
            currentIndex={sectionProgress.currentIndex}
            totalQuestions={questions.length}
            hasAnswered={hasAnswered}
            isLastQuestion={isLastQuestion}
            isLastSection={isLastSection}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onComplete={handleComplete}
          />
        </div>
      </main>

      {/* Floating help button */}
      <FloatingHelpButton currentSection={sectionId} homeworkId="hw4" />
    </div>
  );
}
