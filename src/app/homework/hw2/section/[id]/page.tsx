'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHomeworkStore } from '@/stores/homeworkStore';
import { useAuthStore } from '@/stores/authStore';
import { FloatingHelpButton } from '@/components/homework/HelpButton';
import { HomeworkProgressCompact } from '@/components/homework/HomeworkProgress';
import { SectionNavigation, QuestionProgressBar } from '@/components/homework/SectionNavigation';
import { getQuestionsForHW2Section } from '@/data/homework/hw2-questions';
import { HW2_SECTION_META, type HW2SectionId, type MCQQuestion } from '@/types/homework';
import { cn } from '@/lib/utils';

export default function HW2SectionPage() {
  const router = useRouter();
  const params = useParams();
  const parsedId = parseInt(params.id as string, 10);

  // Validate section ID is 1-5
  const isValidSectionId = !isNaN(parsedId) && parsedId >= 1 && parsedId <= 5;
  const sectionId = (isValidSectionId ? parsedId : 1) as HW2SectionId;

  const { user } = useAuthStore();
  const {
    homework2,
    startSection2,
    submitAnswer2,
    nextQuestion2,
    previousQuestion2,
    completeSection2,
    completeHomework2,
    getSectionProgress2,
    getAnswer2,
    syncToCloud2,
  } = useHomeworkStore();

  // Immediate sync to cloud (no debounce) - more reliable for homework data
  const syncImmediately = useCallback(async () => {
    if (!user) return;

    try {
      await syncToCloud2(user.uid);
    } catch (error) {
      console.error('Failed to sync homework to cloud:', error);
      // Note: Store still persists to localStorage even if cloud sync fails
    }
  }, [user, syncToCloud2]);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const section = getSectionProgress2(sectionId);
  const questions = getQuestionsForHW2Section(sectionId);
  const currentQuestion = questions[section.currentIndex] as MCQQuestion | undefined;
  const meta = HW2_SECTION_META[sectionId];

  const existingAnswer = currentQuestion
    ? getAnswer2(sectionId, currentQuestion.id)
    : undefined;

  // Validate section ID and start section
  useEffect(() => {
    if (!isValidSectionId) {
      console.warn(`Invalid section ID: ${params.id}`);
      router.replace('/homework/hw2');
      return;
    }
    startSection2(sectionId);
  }, [sectionId, isValidSectionId, params.id, startSection2, router]);

  // Sync immediately on tab close/navigation to prevent data loss
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        // Clear any pending debounced sync
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        // Attempt immediate sync (best effort - may not complete)
        syncToCloud2(user.uid);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, syncToCloud2]);

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
  }, [section.currentIndex, existingAnswer]);

  // Handle answer submission
  const handleSubmit = useCallback(() => {
    if (!currentQuestion || selectedOption === null) return;

    const correct = selectedOption === currentQuestion.correctIndex;
    submitAnswer2(sectionId, currentQuestion.id, selectedOption, correct);

    setIsCorrect(correct);
    setShowFeedback(true);

    // Sync to cloud immediately after answer (no debounce for homework data)
    syncImmediately();
  }, [currentQuestion, selectedOption, sectionId, submitAnswer2, syncImmediately]);

  // Handle next question
  const handleNext = () => {
    if (!nextQuestion2(sectionId)) {
      // Last question - this shouldn't happen as we use onComplete for last
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    previousQuestion2(sectionId);
  };

  // Handle section completion
  const handleComplete = async () => {
    completeSection2(sectionId);

    // Immediate sync on section complete
    if (user) {
      await syncToCloud2(user.uid);
    }

    if (sectionId === 5) {
      completeHomework2();
      router.push('/homework/hw2/complete');
    } else {
      router.push(`/homework/hw2/section/${sectionId + 1}`);
    }
  };

  // Keyboard shortcuts for MCQ
  useEffect(() => {
    if (!currentQuestion || showFeedback) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        setSelectedOption(parseInt(key, 10) - 1);
      } else if (key === 'Enter' && selectedOption !== null) {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, showFeedback, selectedOption, handleSubmit]);

  if (!currentQuestion) {
    return null;
  }

  const isLastQuestion = section.currentIndex === questions.length - 1;
  const isLastSection = sectionId === 5;
  const hasAnswered = showFeedback || existingAnswer !== undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/homework/hw2"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Overview</span>
          </Link>
          <div className="flex items-center gap-4">
            <HomeworkProgressCompact
              currentSection={sectionId}
              sectionStatuses={Object.fromEntries(
                ([1, 2, 3, 4, 5] as HW2SectionId[]).map((id) => [
                  id,
                  homework2.sections[id].status,
                ])
              ) as Record<HW2SectionId, 'not_started' | 'in_progress' | 'completed'>}
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
            current={section.currentIndex}
            total={questions.length}
            answered={section.answers.length}
          />

          {/* Question card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {section.currentIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* MCQ questions (all HW2 sections) */}
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
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrectOption = index === currentQuestion.correctIndex;

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (!showFeedback) {
                          setSelectedOption(index);
                        }
                      }}
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
                })}
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
            currentIndex={section.currentIndex}
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
      <FloatingHelpButton currentSection={sectionId} homeworkId="hw2" />
    </div>
  );
}
