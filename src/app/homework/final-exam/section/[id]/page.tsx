'use client';

import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, AlertCircle, BookOpen, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHomeworkStore } from '@/stores/homeworkStore';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/stores/authStore';
import { ExamTimer } from '@/components/homework/ExamTimer';
import { ExamQuestionGrid } from '@/components/homework/ExamQuestionGrid';
import { ExamNavigation } from '@/components/homework/ExamNavigation';
import { QuestionProgressBar } from '@/components/homework/SectionNavigation';
import { getQuestionsForFinalExamSection } from '@/data/homework/final-exam-questions';
import type { FinalExamSectionId } from '@/data/homework/final-exam-questions';
import { FINAL_EXAM_SECTION_META, type MCQQuestion, type TranslationQuestion, type VerseAnalysisQuestion } from '@/types/homework';
import { scoreTranslation } from '@/lib/translation';
import type { NTVerse, TranslationResult } from '@/types';
import { cn } from '@/lib/utils';
import { renderGreekWithBold } from '@/lib/renderGreekText';

const SECTION_IDS: FinalExamSectionId[] = [1, 2, 3];
const IDK_ANSWER = -1; // sentinel value for "I don't know"

function formatFinalExamOption(option: string, sectionId: FinalExamSectionId): string {
  const withoutParentheticalAid = option.replace(/\s+\([^)]*\)/g, '').replace(/\s{2,}/g, ' ').trim();
  if (sectionId !== 2) return withoutParentheticalAid;
  return withoutParentheticalAid.split('/')[0]?.trim() || withoutParentheticalAid;
}

interface MCQOptionProps {
  option: string;
  index: number;
  sectionId: FinalExamSectionId;
  isSelected: boolean;
  isReviewMode: boolean;
  isCorrectOption: boolean;
  onSelect: (index: number) => void;
}

const MCQOption = memo(function MCQOption({
  option, index, sectionId, isSelected, isReviewMode, isCorrectOption, onSelect,
}: MCQOptionProps) {
  return (
    <button
      onClick={() => onSelect(index)}
      disabled={isReviewMode}
      className={cn(
        'w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-all',
        'hover:border-primary hover:bg-primary/5',
        'disabled:hover:border-border disabled:hover:bg-transparent',
        // Exam mode: just highlight selected
        isSelected && !isReviewMode && 'border-primary bg-primary/10',
        // Review mode: show correct/incorrect
        isReviewMode && isCorrectOption && 'border-green-500 bg-green-100 dark:bg-green-900/30',
        isReviewMode && isSelected && !isCorrectOption && 'border-red-500 bg-red-100 dark:bg-red-900/30',
        isReviewMode && !isSelected && !isCorrectOption && 'opacity-50'
      )}
    >
      <span className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium border-2',
        isSelected && !isReviewMode && 'border-primary bg-primary text-primary-foreground',
        !isSelected && !isReviewMode && 'border-muted-foreground/30',
        isReviewMode && isCorrectOption && 'border-green-500 bg-green-500 text-white',
        isReviewMode && isSelected && !isCorrectOption && 'border-red-500 bg-red-500 text-white'
      )}>
        {isReviewMode && isCorrectOption ? <Check className="w-4 h-4" /> :
         isReviewMode && isSelected && !isCorrectOption ? <X className="w-4 h-4" /> :
         index + 1}
      </span>
      <span className="flex-1">{formatFinalExamOption(option, sectionId)}</span>
    </button>
  );
});

export default function FinalExamSectionPage() {
  const router = useRouter();
  const params = useParams();
  const parsedId = parseInt(params.id as string, 10);
  const isValidSectionId = !isNaN(parsedId) && parsedId >= 1 && parsedId <= 3;
  const sectionId = (isValidSectionId ? parsedId : 1) as FinalExamSectionId;

  const { user } = useAuthStore();

  const finalExam = useHomeworkStore(useShallow((state) => state.finalExam));
  const isSubmitted = Boolean(finalExam.submittedAt);
  const sectionProgress = finalExam.sections[sectionId] ?? {
    status: 'not_started' as const, currentIndex: 0, answers: [], score: 0, totalQuestions: 0, flagged: [],
  };

  const startSectionFE = useHomeworkStore((s) => s.startSectionFE);
  const saveAnswerFE = useHomeworkStore((s) => s.saveAnswerFE);
  const submitAnswerFE = useHomeworkStore((s) => s.submitAnswerFE);
  const goToQuestionFE = useHomeworkStore((s) => s.goToQuestionFE);
  const nextQuestionFE = useHomeworkStore((s) => s.nextQuestionFE);
  const previousQuestionFE = useHomeworkStore((s) => s.previousQuestionFE);
  const toggleFlagFE = useHomeworkStore((s) => s.toggleFlagFE);
  const submitExamFE = useHomeworkStore((s) => s.submitExamFE);
  const syncToCloudFE = useHomeworkStore((s) => s.syncToCloudFE);

  const [draftSelections, setDraftSelections] = useState<Record<string, number>>({});
  const [draftTranslations, setDraftTranslations] = useState<Record<string, string>>({});
  const [draftAnalysis, setDraftAnalysis] = useState<Record<string, { matching: Record<string, string>; translation: string }>>({});
  const [translationResults, setTranslationResults] = useState<Record<string, TranslationResult>>({});
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // All questions per section (memoized, stable across renders)
  const allQuestions = useMemo(() => ({
    1: getQuestionsForFinalExamSection(1),
    2: getQuestionsForFinalExamSection(2),
    3: getQuestionsForFinalExamSection(3),
  }), []);

  const questions = allQuestions[sectionId];
  const currentQuestion = questions[sectionProgress.currentIndex];
  const meta = FINAL_EXAM_SECTION_META[sectionId];

  const existingAnswer = useMemo(() => {
    if (!currentQuestion) return undefined;
    return sectionProgress.answers.find(a => a.questionId === currentQuestion.id);
  }, [sectionProgress.answers, currentQuestion]);

  // In exam mode, selectedOption comes from saved answers OR draft
  const selectedOption = currentQuestion?.type === 'mcq'
    ? existingAnswer
      ? existingAnswer.userAnswer as number
      : currentQuestion ? draftSelections[currentQuestion.id] ?? null : null
    : null;

  const translationInput = currentQuestion?.type === 'translation'
    ? existingAnswer
      ? (draftTranslations[currentQuestion.id] !== undefined
          ? draftTranslations[currentQuestion.id]
          : existingAnswer.userAnswer as string)
      : draftTranslations[currentQuestion.id] ?? ''
    : '';

  // Verse analysis draft state
  const currentAnalysisDraft = useMemo(() => {
    if (!currentQuestion || currentQuestion.type !== 'verse-analysis') return { matching: {}, translation: '' };
    const qId = currentQuestion.id;
    if (draftAnalysis[qId]) return draftAnalysis[qId];
    if (existingAnswer) {
      try {
        const parsed = JSON.parse(existingAnswer.userAnswer as string);
        return { matching: parsed.matching || {}, translation: parsed.translation || '' };
      } catch { /* ignore */ }
    }
    return { matching: {} as Record<string, string>, translation: '' };
  }, [currentQuestion, draftAnalysis, existingAnswer]);

  // Global question number
  const globalOffset = SECTION_IDS.filter(id => id < sectionId)
    .reduce((sum, id) => sum + allQuestions[id].length, 0);
  const globalQuestionNumber = globalOffset + sectionProgress.currentIndex + 1;
  const globalTotal = SECTION_IDS.reduce((sum, id) => sum + allQuestions[id].length, 0);

  // Question grid data
  const gridSections = useMemo(() => SECTION_IDS.map(id => ({
    sectionId: id,
    title: FINAL_EXAM_SECTION_META[id].title,
    questionIds: allQuestions[id].map(q => q.id),
    answeredIds: new Set(finalExam.sections[id]?.answers.map(a => a.questionId) || []),
    flaggedIds: new Set(finalExam.sections[id]?.flagged || []),
  })), [allQuestions, finalExam.sections]);

  const isFlagged = (sectionProgress.flagged || []).includes(currentQuestion?.id || '');

  const debouncedSync = useCallback(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(async () => {
      if (user) {
        try { await syncToCloudFE(user.uid); } catch { /* ignore */ }
      }
    }, 2000);
  }, [user, syncToCloudFE]);

  useEffect(() => {
    if (!isValidSectionId) { router.replace('/homework/final-exam'); return; }
    startSectionFE(sectionId);
  }, [sectionId, isValidSectionId, params.id, startSectionFE, router]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      if (user) syncToCloudFE(user.uid);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [user, syncToCloudFE]);

  // Exam mode: selecting an MCQ option auto-saves
  const handleSelectOption = useCallback((index: number) => {
    if (!currentQuestion || isSubmitted) return;
    if (currentQuestion.type === 'mcq') {
      setDraftSelections(prev => ({ ...prev, [currentQuestion.id]: index }));
      saveAnswerFE(sectionId, currentQuestion.id, index);
      debouncedSync();
    }
  }, [currentQuestion, sectionId, saveAnswerFE, debouncedSync, isSubmitted]);

  // Exam mode: save translation on blur
  const handleTranslationBlur = useCallback(() => {
    if (!currentQuestion || currentQuestion.type !== 'translation' || isSubmitted) return;
    const text = draftTranslations[currentQuestion.id];
    if (text !== undefined && text.trim()) {
      saveAnswerFE(sectionId, currentQuestion.id, text);
      debouncedSync();
    }
  }, [currentQuestion, draftTranslations, sectionId, saveAnswerFE, debouncedSync, isSubmitted]);

  // Save verse-analysis answer (called on any matching change or translation blur)
  const saveAnalysisAnswer = useCallback((questionId: string, data: { matching: Record<string, string>; translation: string }) => {
    if (isSubmitted) return;
    const json = JSON.stringify(data);
    saveAnswerFE(sectionId, questionId, json);
    debouncedSync();
  }, [sectionId, saveAnswerFE, debouncedSync, isSubmitted]);

  // Save any in-progress answer before navigating away
  const saveCurrentAnswer = useCallback(() => {
    if (!currentQuestion || isSubmitted) return;
    if (currentQuestion.type === 'translation') {
      const text = draftTranslations[currentQuestion.id];
      if (text?.trim()) saveAnswerFE(sectionId, currentQuestion.id, text);
    } else if (currentQuestion.type === 'verse-analysis') {
      const draft = draftAnalysis[currentQuestion.id];
      if (draft) saveAnalysisAnswer(currentQuestion.id, draft);
    }
  }, [currentQuestion, isSubmitted, draftTranslations, draftAnalysis, sectionId, saveAnswerFE, saveAnalysisAnswer]);

  // Keyboard shortcuts for MCQ (exam mode)
  useEffect(() => {
    if (!currentQuestion || currentQuestion.type !== 'mcq' || isSubmitted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        handleSelectOption(parseInt(e.key, 10) - 1);
      } else if (e.key === '5') {
        handleSelectOption(IDK_ANSWER);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, handleSelectOption, isSubmitted]);

  const handleNext = () => {
    saveCurrentAnswer();
    if (!nextQuestionFE(sectionId)) {
      // End of section: go to next section
      const nextSection = sectionId + 1;
      if (nextSection <= 3) {
        router.push(`/homework/final-exam/section/${nextSection}`);
      }
    }
  };

  const handlePrevious = () => {
    saveCurrentAnswer();
    if (sectionProgress.currentIndex > 0) {
      previousQuestionFE(sectionId);
    } else if (sectionId > 1) {
      // Go to last question of previous section
      const prevSection = (sectionId - 1) as FinalExamSectionId;
      const prevQuestions = allQuestions[prevSection];
      goToQuestionFE(prevSection, prevQuestions.length - 1);
      router.push(`/homework/final-exam/section/${prevSection}`);
    }
  };

  const handleNavigate = (targetSection: FinalExamSectionId, questionIndex: number) => {
    saveCurrentAnswer();
    if (targetSection === sectionId) {
      goToQuestionFE(sectionId, questionIndex);
    } else {
      goToQuestionFE(targetSection, questionIndex);
      router.push(`/homework/final-exam/section/${targetSection}`);
    }
  };

  const handleTimerExpire = useCallback(() => {
    saveCurrentAnswer();
    submitExamFE();
    if (user) syncToCloudFE(user.uid);
    router.push('/homework/final-exam/complete');
  }, [saveCurrentAnswer, submitExamFE, user, syncToCloudFE, router]);

  const handleReview = () => {
    saveCurrentAnswer();
    router.push('/homework/final-exam/review');
  };

  if (!currentQuestion) return null;

  const isLastQuestion = sectionProgress.currentIndex === questions.length - 1;
  const isLastSection = sectionId === 3;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={isSubmitted ? '/homework/final-exam/complete' : '/homework/final-exam'}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{isSubmitted ? 'Back to Results' : 'Exam'}</span>
          </Link>
          <div className="flex items-center gap-3">
            {!isSubmitted && finalExam.timerStartedAt && (
              <ExamTimer
                startedAt={finalExam.timerStartedAt}
                duration={finalExam.timerDuration}
                onExpire={handleTimerExpire}
              />
            )}
            {isSubmitted && (
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                Review Mode
              </span>
            )}
            {!isSubmitted && (
              <ExamQuestionGrid
                sections={gridSections}
                currentSectionId={sectionId}
                currentQuestionIndex={sectionProgress.currentIndex}
                onNavigate={handleNavigate}
              />
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Section {sectionId} &middot; {meta.title}</p>
          </div>

          {!isSubmitted && (
            <QuestionProgressBar
              current={sectionProgress.currentIndex}
              total={questions.length}
              answered={sectionProgress.answers.length}
            />
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Question {sectionProgress.currentIndex + 1}</span>
                {!isSubmitted && existingAnswer && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentQuestion.type === 'verse-analysis' ? (
                <VerseAnalysisSection
                  question={currentQuestion as VerseAnalysisQuestion}
                  draft={currentAnalysisDraft}
                  isSubmitted={isSubmitted}
                  existingAnswer={existingAnswer}
                  translationResults={translationResults}
                  setTranslationResults={setTranslationResults}
                  onMatchingChange={(greek, category) => {
                    const qId = currentQuestion.id;
                    const current = draftAnalysis[qId] || currentAnalysisDraft;
                    const updated = { ...current, matching: { ...current.matching, [greek]: category } };
                    setDraftAnalysis(prev => ({ ...prev, [qId]: updated }));
                    saveAnalysisAnswer(qId, updated);
                  }}
                  onTranslationChange={(val) => {
                    const qId = currentQuestion.id;
                    const current = draftAnalysis[qId] || currentAnalysisDraft;
                    setDraftAnalysis(prev => ({ ...prev, [qId]: { ...current, translation: val } }));
                  }}
                  onTranslationBlur={() => {
                    const qId = currentQuestion.id;
                    const draft = draftAnalysis[qId] || currentAnalysisDraft;
                    if (draft.translation?.trim() || Object.keys(draft.matching).length > 0) {
                      saveAnalysisAnswer(qId, draft);
                    }
                  }}
                />
              ) : currentQuestion.type === 'translation' ? (
                <TranslationSection
                  question={currentQuestion as TranslationQuestion}
                  translationInput={translationInput}
                  isSubmitted={isSubmitted}
                  existingAnswer={existingAnswer}
                  translationResults={translationResults}
                  setTranslationResults={setTranslationResults}
                  onInputChange={(val) => {
                    setDraftTranslations(prev => ({ ...prev, [currentQuestion.id]: val }));
                  }}
                  onBlur={handleTranslationBlur}
                />
              ) : (
                <MCQSection
                  question={currentQuestion as MCQQuestion}
                  sectionId={sectionId}
                  selectedOption={selectedOption}
                  isSubmitted={isSubmitted}
                  existingAnswer={existingAnswer}
                  onSelect={handleSelectOption}
                />
              )}
            </CardContent>
          </Card>

          {!isSubmitted ? (
            <ExamNavigation
              currentIndex={sectionProgress.currentIndex}
              totalQuestions={questions.length}
              globalQuestionNumber={globalQuestionNumber}
              globalTotal={globalTotal}
              isFlagged={isFlagged}
              isLastQuestion={isLastQuestion}
              isLastSection={isLastSection}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onToggleFlag={() => currentQuestion && toggleFlagFE(sectionId, currentQuestion.id)}
              onReview={handleReview}
            />
          ) : (
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={globalQuestionNumber <= 1}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Q {globalQuestionNumber} of {globalTotal}
              </span>
              <Button onClick={handleNext} disabled={globalQuestionNumber >= globalTotal}>
                Next
              </Button>
            </div>
          )}

          {!isSubmitted && (
            <p className="text-xs text-muted-foreground text-center">
              {currentQuestion.type === 'mcq' ? 'Press 1-4 to select, 5 for "I don\'t know". ' : ''}
              Your answers are saved automatically.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

// --- MCQ Section (exam mode: no feedback, review mode: feedback) ---
function MCQSection({
  question, sectionId, selectedOption, isSubmitted, existingAnswer, onSelect,
}: {
  question: MCQQuestion;
  sectionId: FinalExamSectionId;
  selectedOption: number | null;
  isSubmitted: boolean;
  existingAnswer: { isCorrect: boolean; userAnswer: string | number } | undefined;
  onSelect: (index: number) => void;
}) {
  const isCorrect = existingAnswer?.isCorrect ?? false;
  return (
    <>
      <div className="space-y-2">
        {question.greek && (
          <p className="text-3xl greek-text font-serif tracking-wide text-center mb-4">
            {renderGreekWithBold(question.greek)}
          </p>
        )}
        <p className="text-lg font-medium">{question.question}</p>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <MCQOption
            key={index}
            option={option}
            index={index}
            sectionId={sectionId}
            isSelected={selectedOption === index}
            isReviewMode={isSubmitted}
            isCorrectOption={index === question.correctIndex}
            onSelect={onSelect}
          />
        ))}
        {/* "I don't know" option — exam mode only */}
        {!isSubmitted && (
          <button
            onClick={() => onSelect(IDK_ANSWER)}
            className={cn(
              'w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-all',
              'hover:border-muted-foreground/50 hover:bg-muted/50',
              selectedOption === IDK_ANSWER && 'border-muted-foreground bg-muted'
            )}
          >
            <span className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium border-2',
              selectedOption === IDK_ANSWER
                ? 'border-muted-foreground bg-muted-foreground text-background'
                : 'border-muted-foreground/30'
            )}>
              ?
            </span>
            <span className="flex-1 text-muted-foreground italic">I don&apos;t know (0 marks)</span>
          </button>
        )}
      </div>

      {isSubmitted && existingAnswer && (() => {
        const wasIdk = existingAnswer.userAnswer === IDK_ANSWER;
        const wasWrong = !isCorrect && !wasIdk;
        return (
          <div className={cn(
            'flex items-start gap-3 p-4 rounded-lg',
            isCorrect
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : wasIdk
                ? 'bg-muted text-muted-foreground'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          )}>
            {isCorrect ? <Check className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <div>
              <p className="font-medium">
                {isCorrect ? 'Correct! (+1)' : wasIdk ? 'Skipped (0)' : 'Incorrect (-0.5)'}
              </p>
              <p className="text-sm mt-1">{question.explanation}</p>
            </div>
          </div>
        );
      })()}
    </>
  );
}

// --- Translation Section (exam mode: just textarea, review mode: full feedback) ---
function TranslationSection({
  question, translationInput, isSubmitted, existingAnswer, translationResults,
  setTranslationResults, onInputChange, onBlur,
}: {
  question: TranslationQuestion;
  translationInput: string;
  isSubmitted: boolean;
  existingAnswer: { isCorrect: boolean; userAnswer: string | number } | undefined;
  translationResults: Record<string, TranslationResult>;
  setTranslationResults: React.Dispatch<React.SetStateAction<Record<string, TranslationResult>>>;
  onInputChange: (val: string) => void;
  onBlur: () => void;
}) {
  // In review mode, compute score if not already cached
  useEffect(() => {
    if (isSubmitted && existingAnswer && !translationResults[question.id]) {
      const verse: NTVerse = {
        id: question.id, book: '', chapter: 0, verse: 0,
        reference: question.reference, greek: question.greek,
        transliteration: question.transliteration,
        referenceTranslation: question.referenceTranslation,
        keyTerms: question.keyTerms, difficulty: question.difficulty,
      };
      const result = scoreTranslation(verse, existingAnswer.userAnswer as string);
      setTranslationResults(prev => ({ ...prev, [question.id]: result }));
    }
  }, [isSubmitted, existingAnswer, question, translationResults, setTranslationResults]);

  const result = translationResults[question.id];
  const userText = translationInput || (existingAnswer?.userAnswer as string) || '';

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{question.reference}</span>
        </div>
      </div>

      <p className="text-2xl greek-text font-serif tracking-wide text-center leading-relaxed">
        {question.greek}
      </p>

      {!isSubmitted ? (
        <textarea
          value={translationInput}
          onChange={(e) => onInputChange(e.target.value)}
          onBlur={onBlur}
          placeholder="Translate this verse..."
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      ) : (
        <div className="space-y-4">
          {result && (
            <div className={cn(
              'flex items-start gap-3 p-4 rounded-lg',
              result.score >= 7 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : result.score >= 5 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            )}>
              {result.score >= 5 ? <Check className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className="font-medium">Score: {result.score}/10</p>
                <p className="text-sm mt-1">{result.feedback}</p>
              </div>
            </div>
          )}

          <div className="text-sm">
            <p className="font-medium mb-1">Your translation:</p>
            <p className="text-muted-foreground italic">{userText}</p>
          </div>

          <div className="text-sm">
            <p className="font-medium mb-1">Reference translation:</p>
            <p className="text-muted-foreground">{question.referenceTranslation}</p>
          </div>

          {result && result.keyTermsMissed.length > 0 && (
            <div className="text-sm">
              <p className="font-medium mb-1">Missed key terms:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                {result.keyTermsMissed.map(term => <li key={term}>{term}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// --- Verse Analysis Section (matching + translation) ---
function VerseAnalysisSection({
  question, draft, isSubmitted, existingAnswer, translationResults,
  setTranslationResults, onMatchingChange, onTranslationChange, onTranslationBlur,
}: {
  question: VerseAnalysisQuestion;
  draft: { matching: Record<string, string>; translation: string };
  isSubmitted: boolean;
  existingAnswer: { isCorrect: boolean; userAnswer: string | number } | undefined;
  translationResults: Record<string, TranslationResult>;
  setTranslationResults: React.Dispatch<React.SetStateAction<Record<string, TranslationResult>>>;
  onMatchingChange: (greek: string, category: string) => void;
  onTranslationChange: (val: string) => void;
  onTranslationBlur: () => void;
}) {
  // Build shuffled category options (correct + distractors)
  const categoryOptions = useMemo(() => {
    const correct = question.matchingPairs.map(p => p.category);
    const all = [...correct, ...question.distractorCategories];
    // Deduplicate and sort for stable display
    return [...new Set(all)].sort();
  }, [question]);

  // Parse saved answer for review mode
  const savedData = useMemo(() => {
    if (!existingAnswer) return { matching: {}, translation: '' };
    try {
      const parsed = JSON.parse(existingAnswer.userAnswer as string);
      return { matching: parsed.matching || {}, translation: parsed.translation || '' };
    } catch {
      return { matching: {}, translation: (existingAnswer.userAnswer as string) || '' };
    }
  }, [existingAnswer]);

  const currentMatching = isSubmitted ? savedData.matching : draft.matching;
  const currentTranslation = isSubmitted ? savedData.translation : draft.translation;

  // Compute translation score for review mode
  useEffect(() => {
    if (isSubmitted && existingAnswer && !translationResults[question.id]) {
      const verse: NTVerse = {
        id: question.id, book: '', chapter: 0, verse: 0,
        reference: question.reference, greek: question.greek,
        transliteration: question.transliteration,
        referenceTranslation: question.referenceTranslation,
        keyTerms: question.keyTerms, difficulty: question.difficulty,
      };
      const result = scoreTranslation(verse, savedData.translation);
      setTranslationResults(prev => ({ ...prev, [question.id]: result }));
    }
  }, [isSubmitted, existingAnswer, question, savedData.translation, translationResults, setTranslationResults]);

  const translationResult = translationResults[question.id];

  // Count matching results for review
  const matchingResults = useMemo(() => {
    if (!isSubmitted) return null;
    let correct = 0;
    const details = question.matchingPairs.map(pair => {
      const studentAnswer = currentMatching[pair.greek] || '';
      const isCorrect = studentAnswer === pair.category;
      if (isCorrect) correct++;
      return { greek: pair.greek, correctCategory: pair.category, studentCategory: studentAnswer, isCorrect };
    });
    return { correct, total: question.matchingPairs.length, details };
  }, [isSubmitted, question.matchingPairs, currentMatching]);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{question.reference}</span>
        </div>
        {!isSubmitted && (
          <span className="text-xs text-muted-foreground">2 pts matching + 2 pts translation</span>
        )}
      </div>

      <p className="text-2xl greek-text font-serif tracking-wide text-center leading-relaxed">
        {question.greek}
      </p>

      {/* Part A: Matching */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">
          Part A: Match each Greek word to its grammatical category
        </p>
        <div className="space-y-2">
          {question.matchingPairs.map((pair) => {
            const studentChoice = currentMatching[pair.greek] || '';
            const isCorrectMatch = isSubmitted && studentChoice === pair.category;
            const isWrongMatch = isSubmitted && studentChoice && studentChoice !== pair.category;

            return (
              <div key={pair.greek} className={cn(
                'flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border',
                isCorrectMatch && 'bg-green-50 dark:bg-green-900/20 border-green-300',
                isWrongMatch && 'bg-red-50 dark:bg-red-900/20 border-red-300',
              )}>
                <span className="greek-text font-serif text-lg shrink-0 min-w-[120px] font-medium">
                  {pair.greek}
                </span>
                <span className="text-muted-foreground shrink-0">&rarr;</span>
                {!isSubmitted ? (
                  <select
                    value={studentChoice}
                    onChange={(e) => onMatchingChange(pair.greek, e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select category...</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex-1 text-sm">
                    {isCorrectMatch ? (
                      <span className="flex items-center gap-1 text-green-700 dark:text-green-300">
                        <Check className="w-4 h-4" /> {pair.category}
                      </span>
                    ) : (
                      <div>
                        {studentChoice ? (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <X className="w-4 h-4" /> {studentChoice}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">(no answer)</span>
                        )}
                        <span className="text-green-600 dark:text-green-400 text-xs block mt-0.5">
                          Correct: {pair.category}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {isSubmitted && matchingResults && (
          <p className="text-sm font-medium text-muted-foreground">
            Matching: {matchingResults.correct}/{matchingResults.total} correct
          </p>
        )}
      </div>

      {/* Part B: Translation */}
      <div className="space-y-3 pt-2 border-t">
        <p className="text-sm font-semibold text-foreground">
          Part B: Translate the verse into English
        </p>
        {!isSubmitted ? (
          <textarea
            value={currentTranslation}
            onChange={(e) => onTranslationChange(e.target.value)}
            onBlur={onTranslationBlur}
            placeholder="Write your English translation..."
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
          />
        ) : (
          <div className="space-y-3">
            {translationResult && (
              <div className={cn(
                'flex items-start gap-3 p-3 rounded-lg text-sm',
                translationResult.score >= 7 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : translationResult.score >= 5 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
              )}>
                {translationResult.score >= 5 ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <div>
                  <p className="font-medium">Translation score: {translationResult.score}/10</p>
                  <p className="text-xs mt-1">{translationResult.feedback}</p>
                </div>
              </div>
            )}
            <div className="text-sm">
              <p className="font-medium mb-1">Your translation:</p>
              <p className="text-muted-foreground italic">{currentTranslation || '(no answer)'}</p>
            </div>
            <div className="text-sm">
              <p className="font-medium mb-1">Reference translation:</p>
              <p className="text-muted-foreground">{question.referenceTranslation}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
