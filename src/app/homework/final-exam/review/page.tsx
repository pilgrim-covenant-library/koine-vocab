'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, ClipboardCheck, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHomeworkStore } from '@/stores/homeworkStore';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/stores/authStore';
import { ExamTimer } from '@/components/homework/ExamTimer';
import { getQuestionsForFinalExamSection } from '@/data/homework/final-exam-questions';
import { FINAL_EXAM_SECTION_META, type FinalExamSectionId } from '@/types/homework';
import { cn } from '@/lib/utils';

const SECTION_IDS: FinalExamSectionId[] = [1, 2, 3];

export default function FinalExamReviewPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const finalExam = useHomeworkStore(useShallow((s) => s.finalExam));
  const submitExamFE = useHomeworkStore((s) => s.submitExamFE);
  const syncToCloudFE = useHomeworkStore((s) => s.syncToCloudFE);
  const goToQuestionFE = useHomeworkStore((s) => s.goToQuestionFE);

  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const sectionData = useMemo(() => SECTION_IDS.map(id => {
    const section = finalExam.sections[id];
    const questions = getQuestionsForFinalExamSection(id);
    const answeredIds = new Set(section.answers.map(a => a.questionId));
    const flaggedIds = new Set(section.flagged || []);
    const unanswered = questions.filter(q => !answeredIds.has(q.id)).map((q, idx) => ({
      id: q.id,
      index: questions.findIndex(qq => qq.id === q.id),
    }));
    return {
      sectionId: id,
      meta: FINAL_EXAM_SECTION_META[id],
      total: questions.length,
      answered: answeredIds.size,
      flagged: flaggedIds.size,
      unanswered,
      flaggedQuestions: questions
        .map((q, idx) => ({ id: q.id, index: idx }))
        .filter(q => flaggedIds.has(q.id)),
    };
  }), [finalExam.sections]);

  const totalAnswered = sectionData.reduce((s, d) => s + d.answered, 0);
  const totalQuestions = sectionData.reduce((s, d) => s + d.total, 0);
  const totalFlagged = sectionData.reduce((s, d) => s + d.flagged, 0);
  const totalUnanswered = totalQuestions - totalAnswered;

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    submitExamFE();
    if (user) {
      try { await syncToCloudFE(user.uid); } catch { /* ignore */ }
    }
    router.push('/homework/final-exam/complete');
  }, [submitExamFE, syncToCloudFE, user, router]);

  const handleTimerExpire = useCallback(() => {
    submitExamFE();
    if (user) syncToCloudFE(user.uid);
    router.push('/homework/final-exam/complete');
  }, [submitExamFE, syncToCloudFE, user, router]);

  const navigateTo = (sectionId: FinalExamSectionId, questionIndex: number) => {
    goToQuestionFE(sectionId, questionIndex);
    router.push(`/homework/final-exam/section/${sectionId}`);
  };

  if (finalExam.submittedAt) {
    router.replace('/homework/final-exam/complete');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/homework/final-exam/section/1"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Exam</span>
          </Link>
          {finalExam.timerStartedAt && (
            <ExamTimer
              startedAt={finalExam.timerStartedAt}
              duration={finalExam.timerDuration}
              onExpire={handleTimerExpire}
            />
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Review Your Exam</h1>
            <p className="text-muted-foreground">
              Check your answers before submitting. You cannot change answers after submission.
            </p>
          </div>

          {/* Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-around text-center">
                <div>
                  <p className="text-3xl font-bold">{totalAnswered}</p>
                  <p className="text-sm text-muted-foreground">Answered</p>
                </div>
                <div className="text-3xl text-muted-foreground">/</div>
                <div>
                  <p className="text-3xl font-bold">{totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                {totalFlagged > 0 && (
                  <>
                    <div className="w-px h-10 bg-border" />
                    <div>
                      <p className="text-3xl font-bold text-orange-500">{totalFlagged}</p>
                      <p className="text-sm text-muted-foreground">Flagged</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Warning for unanswered */}
          {totalUnanswered > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{totalUnanswered} unanswered question{totalUnanswered > 1 ? 's' : ''}</p>
                <p className="text-sm mt-1">Unanswered questions will be marked as incorrect.</p>
              </div>
            </div>
          )}

          {/* Per-section breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Section Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionData.map((s) => (
                <div key={s.sectionId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigateTo(s.sectionId, 0)}
                      className="font-medium hover:text-primary transition-colors text-left"
                    >
                      {s.meta.title}
                    </button>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={cn(
                        s.answered === s.total ? 'text-green-600' : 'text-muted-foreground'
                      )}>
                        {s.answered}/{s.total}
                      </span>
                      {s.flagged > 0 && (
                        <span className="flex items-center gap-1 text-orange-500">
                          <Flag className="w-3 h-3" />
                          {s.flagged}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        s.answered === s.total ? 'bg-green-500' : 'bg-primary'
                      )}
                      style={{ width: `${(s.answered / s.total) * 100}%` }}
                    />
                  </div>

                  {/* Unanswered questions */}
                  {s.unanswered.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {s.unanswered.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => navigateTo(s.sectionId, q.index)}
                          className="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 transition-colors"
                        >
                          Q{q.index + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Flagged questions */}
                  {s.flaggedQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {s.flaggedQuestions.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => navigateTo(s.sectionId, q.index)}
                          className="text-xs px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 transition-colors flex items-center gap-1"
                        >
                          <Flag className="w-2.5 h-2.5" />
                          Q{q.index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit buttons */}
          <div className="flex flex-col gap-3">
            {!showConfirm ? (
              <>
                <Button size="lg" onClick={() => setShowConfirm(true)} className="gap-2">
                  <ClipboardCheck className="w-5 h-5" />
                  Submit Exam
                </Button>
                <Link href="/homework/final-exam/section/1">
                  <Button variant="outline" size="lg" className="w-full">
                    Back to Exam
                  </Button>
                </Link>
              </>
            ) : (
              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="pt-6 space-y-4">
                  <p className="text-center font-medium">
                    Are you sure you want to submit?
                  </p>
                  <p className="text-sm text-center text-muted-foreground">
                    Once submitted, you cannot change your answers.
                    {totalUnanswered > 0 && ` ${totalUnanswered} question${totalUnanswered > 1 ? 's are' : ' is'} unanswered.`}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowConfirm(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Confirm Submit'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
