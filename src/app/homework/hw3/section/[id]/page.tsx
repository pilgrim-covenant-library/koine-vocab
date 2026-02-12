'use client';

import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHomeworkStore } from '@/stores/homeworkStore';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/stores/authStore';
import { FloatingHelpButton } from '@/components/homework/HelpButton';
import { HomeworkProgressCompact } from '@/components/homework/HomeworkProgress';
import { SectionNavigation, QuestionProgressBar } from '@/components/homework/SectionNavigation';
import { getQuestionsForHW3Section, type HW3SectionId } from '@/data/homework/hw3-questions';
import { HW3_SECTION_META, type MCQQuestion } from '@/types/homework';
import { cn } from '@/lib/utils';

// Static sections array - avoid recreating on every render
const SECTION_IDS: HW3SectionId[] = [1, 2, 3, 4, 5];

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

export default function HW3SectionPage() {
  const router = useRouter();
  const params = useParams();
  const parsedId = parseInt(params.id as string, 10);

  // Validate section ID is 1-5
  const isValidSectionId = !isNaN(parsedId) && parsedId >= 1 && parsedId <= 5;
  const sectionId = (isValidSectionId ? parsedId : 1) as HW3SectionId;

  const { user } = useAuthStore();

  // Use targeted selectors to prevent over-subscription
  // Only re-render when this specific section changes
  const sectionProgress = useHomeworkStore(
    useShallow((state) => state.homework3.sections[sectionId])
  );
  const sectionStatuses = useHomeworkStore(
    useShallow((state) =>
      Object.fromEntries(
        SECTION_IDS.map((id) => [id, state.homework3.sections[id].status])
      ) as Record<HW3SectionId, 'not_started' | 'in_progress' | 'completed'>
    )
  );

  // Actions don't cause re-renders - select individually
  const startSection3 = useHomeworkStore((state) => state.startSection3);
  const submitAnswer3 = useHomeworkStore((state) => state.submitAnswer3);
  const nextQuestion3 = useHomeworkStore((state) => state.nextQuestion3);
  const previousQuestion3 = useHomeworkStore((state) => state.previousQuestion3);
  const completeSection3 = useHomeworkStore((state) => state.completeSection3);
  const completeHomework3 = useHomeworkStore((state) => state.completeHomework3);
  const syncToCloud3 = useHomeworkStore((state) => state.syncToCloud3);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize questions to avoid recalculation
  const questions = useMemo(() => getQuestionsForHW3Section(sectionId), [sectionId]);
  const currentQuestion = questions[sectionProgress.currentIndex] as MCQQuestion | undefined;
  const meta = HW3_SECTION_META[sectionId];

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
          await syncToCloud3(user.uid);
        } catch (error) {
          console.error('Failed to sync homework to cloud:', error);
        }
      }
    }, 1000);
  }, [user, syncToCloud3]);

  // Validate section ID and start section
  useEffect(() => {
    if (!isValidSectionId) {
      console.warn(`Invalid section ID: ${params.id}`);
      router.replace('/homework/hw3');
      return;
    }
    startSection3(sectionId);
  }, [sectionId, isValidSectionId, params.id, startSection3, router]);

  // Sync on tab close/navigation - flush any pending debounced sync
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear any pending debounced sync and do immediate sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (user) {
        // Attempt immediate sync (best effort - may not complete)
        syncToCloud3(user.uid);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Cleanup: flush pending sync on unmount
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, syncToCloud3]);

  // Reset input when question changes
  useEffect(() => {
    if (existingAnswer) {
      setShowFeedback(true);
      setIsCorrect(existingAnswer.isCorrect);
      setSelectedOption(existingAnswer.userAnswer as number);
    } else {
      setShowFeedback(false);
      setIsCorrect(false);
      setSelectedOption(null);
    }
  }, [sectionProgress.currentIndex, existingAnswer]);

  // Handle answer submission
  const handleSubmit = useCallback(() => {
    if (!currentQuestion || selectedOption === null) return;

    const correct = selectedOption === currentQuestion.correctIndex;
    submitAnswer3(sectionId, currentQuestion.id, selectedOption, correct);

    setIsCorrect(correct);
    setShowFeedback(true);

    // Debounced sync - batches rapid consecutive answers
    debouncedSync();
  }, [currentQuestion, selectedOption, sectionId, submitAnswer3, debouncedSync]);

  // Handle next question
  const handleNext = () => {
    if (!nextQuestion3(sectionId)) {
      // Last question - this shouldn't happen as we use onComplete for last
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    previousQuestion3(sectionId);
  };

  // Handle section completion
  const handleComplete = async () => {
    completeSection3(sectionId);

    // Immediate sync on section complete
    if (user) {
      await syncToCloud3(user.uid);
    }

    if (sectionId === 5) {
      completeHomework3();
      router.push('/homework/hw3/complete');
    } else {
      router.push(`/homework/hw3/section/${sectionId + 1}`);
    }
  };

  // Use ref to store handleSubmit to avoid re-attaching listener on every render
  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  // Keyboard shortcuts for MCQ - stabilized with refs
  useEffect(() => {
    if (!currentQuestion || showFeedback) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        setSelectedOption(parseInt(key, 10) - 1);
      } else if (key === 'Enter' && selectedOption !== null) {
        handleSubmitRef.current(); // Use ref to avoid dependency
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, showFeedback, selectedOption]); // Removed handleSubmit dependency

  // Memoized handler for MCQ option selection
  const handleSelectOption = useCallback((index: number) => {
    if (!showFeedback) setSelectedOption(index);
  }, [showFeedback]);

  if (!currentQuestion) {
    return null;
  }

  const isLastQuestion = sectionProgress.currentIndex === questions.length - 1;
  const isLastSection = sectionId === 5;
  const hasAnswered = showFeedback || existingAnswer !== undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/homework/hw3"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Overview</span>
          </Link>
          <div className="flex items-center gap-4">
            <HomeworkProgressCompact
              currentSection={sectionId}
              sectionStatuses={sectionStatuses}
              sectionMeta={HW3_SECTION_META}
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
              {/* MCQ questions (all HW3 sections) */}
              <div className="space-y-2">
                {currentQuestion.greek && (
                  <p className="text-3xl greek-text font-serif tracking-wide text-center mb-4">
                    {currentQuestion.greek}
                  </p>
                )}
                {currentQuestion.vocabHelp && (
                  <p className="text-sm text-muted-foreground text-center mb-4 italic">
                    {currentQuestion.vocabHelp}
                  </p>
                )}
                <p className="text-lg font-medium">
                  {currentQuestion.question}
                </p>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <MCQOption
                    key={index}
                    option={option}
                    index={index}
                    isSelected={selectedOption === index}
                    showFeedback={showFeedback}
                    isCorrectOption={index === currentQuestion.correctIndex}
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
                      {currentQuestion.explanation}
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
      <FloatingHelpButton currentSection={sectionId} homeworkId="hw3" />
    </div>
  );
}
