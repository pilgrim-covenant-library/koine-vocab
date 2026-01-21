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
import { getQuestionsForSection } from '@/data/homework/hw1-questions';
import { SECTION_META, type SectionId, type TransliterationQuestion, type VerseQuestion, type MCQQuestion } from '@/types/homework';
import { cn } from '@/lib/utils';

export default function SectionPage() {
  const router = useRouter();
  const params = useParams();
  const parsedId = parseInt(params.id as string, 10);

  // Validate section ID is 1-5
  const isValidSectionId = !isNaN(parsedId) && parsedId >= 1 && parsedId <= 5;
  const sectionId = (isValidSectionId ? parsedId : 1) as SectionId;

  const { user } = useAuthStore();
  const {
    homework1,
    startSection,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    completeSection,
    completeHomework,
    getSectionProgress,
    getAnswer,
    syncToCloud,
  } = useHomeworkStore();

  // Immediate sync to cloud (no debounce) - more reliable for homework data
  const syncImmediately = useCallback(async () => {
    if (!user) return;

    try {
      await syncToCloud(user.uid);
    } catch (error) {
      console.error('Failed to sync homework to cloud:', error);
      // Note: Store still persists to localStorage even if cloud sync fails
    }
  }, [user, syncToCloud]);

  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const section = getSectionProgress(sectionId);
  const questions = getQuestionsForSection(sectionId);
  const currentQuestion = questions[section.currentIndex];
  const meta = SECTION_META[sectionId];

  const existingAnswer = currentQuestion
    ? getAnswer(sectionId, currentQuestion.id)
    : undefined;

  // Validate section ID and start section
  useEffect(() => {
    if (!isValidSectionId) {
      console.warn(`Invalid section ID: ${params.id}`);
      router.replace('/homework/hw1');
      return;
    }
    startSection(sectionId);
  }, [sectionId, isValidSectionId, params.id, startSection, router]);

  // Sync immediately on tab close/navigation to prevent data loss
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        // Clear any pending debounced sync
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        // Attempt immediate sync (best effort - may not complete)
        syncToCloud(user.uid);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, syncToCloud]);

  // Reset input when question changes
  useEffect(() => {
    if (existingAnswer) {
      setShowFeedback(true);
      setIsCorrect(existingAnswer.isCorrect);
      if (currentQuestion?.type === 'mcq') {
        setSelectedOption(existingAnswer.userAnswer as number);
        setUserInput('');
      } else {
        setUserInput(existingAnswer.userAnswer as string);
        setSelectedOption(null);
      }
    } else {
      setShowFeedback(false);
      setIsCorrect(false);
      setUserInput('');
      setSelectedOption(null);
    }
  }, [section.currentIndex, existingAnswer, currentQuestion?.type]);

  // Normalize transliteration for comparison
  const normalizeTransliteration = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/ē/g, 'e')
      .replace(/ō/g, 'o')
      .replace(/ā/g, 'a')
      .replace(/ī/g, 'i')
      .replace(/ū/g, 'u')
      .replace(/[''ʼ]/g, '') // Remove apostrophes
      .replace(/\s+/g, ' '); // Normalize whitespace
  };

  // Check transliteration answer
  const checkTransliterationAnswer = (question: TransliterationQuestion | VerseQuestion): boolean => {
    const normalized = normalizeTransliteration(userInput);
    const expectedNormalized = normalizeTransliteration(question.answer);

    if (normalized === expectedNormalized) return true;

    // Check variants
    for (const variant of question.variants) {
      if (normalized === normalizeTransliteration(variant)) return true;
    }

    return false;
  };

  // Handle answer submission
  const handleSubmit = useCallback(() => {
    if (!currentQuestion) return;

    let correct = false;

    if (currentQuestion.type === 'mcq') {
      if (selectedOption === null) return;
      correct = selectedOption === (currentQuestion as MCQQuestion).correctIndex;
      submitAnswer(sectionId, currentQuestion.id, selectedOption, correct);
    } else {
      if (!userInput.trim()) return;
      correct = checkTransliterationAnswer(currentQuestion as TransliterationQuestion | VerseQuestion);
      submitAnswer(sectionId, currentQuestion.id, userInput, correct);
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    // Sync to cloud immediately after answer (no debounce for homework data)
    syncImmediately();
  }, [currentQuestion, selectedOption, userInput, sectionId, submitAnswer, syncImmediately]);

  // Handle next question
  const handleNext = () => {
    if (!nextQuestion(sectionId)) {
      // Last question - this shouldn't happen as we use onComplete for last
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    previousQuestion(sectionId);
  };

  // Handle section completion
  const handleComplete = async () => {
    completeSection(sectionId);

    // Immediate sync on section complete
    if (user) {
      await syncToCloud(user.uid);
    }

    if (sectionId === 5) {
      completeHomework();
      router.push('/homework/hw1/complete');
    } else {
      router.push(`/homework/hw1/section/${sectionId + 1}`);
    }
  };

  // Keyboard shortcuts for MCQ
  useEffect(() => {
    if (currentQuestion?.type !== 'mcq' || showFeedback) return;

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
  }, [currentQuestion?.type, showFeedback, selectedOption, handleSubmit]);

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
            href="/homework/hw1"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Overview</span>
          </Link>
          <div className="flex items-center gap-4">
            <HomeworkProgressCompact
              currentSection={sectionId}
              sectionStatuses={Object.fromEntries(
                ([1, 2, 3, 4, 5] as SectionId[]).map((id) => [
                  id,
                  homework1.sections[id].status,
                ])
              ) as Record<SectionId, 'not_started' | 'in_progress' | 'completed'>}
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
              {/* Transliteration questions (Sections 1 & 2) */}
              {(currentQuestion.type === 'transliteration' || currentQuestion.type === 'verse') && (
                <>
                  <div className="text-center space-y-2">
                    {currentQuestion.type === 'verse' && (
                      <p className="text-sm text-muted-foreground">
                        {(currentQuestion as VerseQuestion).reference}
                      </p>
                    )}
                    <p className="text-3xl greek-text font-serif tracking-wide">
                      {currentQuestion.greek}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Type the transliteration in English letters
                    </p>
                  </div>

                  <div className="space-y-2">
                    {currentQuestion.type === 'verse' ? (
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        disabled={showFeedback}
                        placeholder="Type your transliteration here..."
                        className={cn(
                          'w-full px-4 py-3 rounded-lg border bg-background text-lg',
                          'focus:outline-none focus:ring-2 focus:ring-primary',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          'min-h-[100px] resize-none',
                          showFeedback && isCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/20',
                          showFeedback && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        )}
                        rows={3}
                      />
                    ) : (
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !showFeedback && userInput.trim()) {
                            handleSubmit();
                          }
                        }}
                        disabled={showFeedback}
                        placeholder="Type your answer..."
                        className={cn(
                          'w-full px-4 py-3 rounded-lg border bg-background text-lg text-center',
                          'focus:outline-none focus:ring-2 focus:ring-primary',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          showFeedback && isCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/20',
                          showFeedback && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        )}
                        autoFocus
                      />
                    )}
                  </div>

                  {/* Feedback */}
                  {showFeedback && (
                    <div
                      className={cn(
                        'flex items-start gap-3 p-4 rounded-lg',
                        isCorrect
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      )}
                    >
                      {isCorrect ? (
                        <Check className="w-5 h-5 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">
                          {isCorrect ? 'Correct!' : 'Not quite right'}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm mt-1">
                            The correct answer is: <strong>{currentQuestion.answer}</strong>
                          </p>
                        )}
                        {currentQuestion.type === 'transliteration' && (currentQuestion as TransliterationQuestion).gloss && (
                          <p className="text-sm mt-1 opacity-80">
                            Meaning: {(currentQuestion as TransliterationQuestion).gloss}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit button (only show if not yet answered) */}
                  {!showFeedback && (
                    <Button
                      onClick={handleSubmit}
                      disabled={!userInput.trim()}
                      className="w-full"
                    >
                      Check Answer
                    </Button>
                  )}
                </>
              )}

              {/* MCQ questions (Sections 3, 4, 5) */}
              {currentQuestion.type === 'mcq' && (
                <>
                  <div className="space-y-2">
                    {(currentQuestion as MCQQuestion).greek && (
                      <p className="text-3xl greek-text font-serif tracking-wide text-center mb-4">
                        {(currentQuestion as MCQQuestion).greek}
                      </p>
                    )}
                    <p className="text-lg font-medium">
                      {(currentQuestion as MCQQuestion).question}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(currentQuestion as MCQQuestion).options.map((option, index) => {
                      const isSelected = selectedOption === index;
                      const isCorrectOption = index === (currentQuestion as MCQQuestion).correctIndex;

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
      <FloatingHelpButton currentSection={sectionId} />
    </div>
  );
}
