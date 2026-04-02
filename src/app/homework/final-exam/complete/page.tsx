'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, CheckCircle, RotateCcw, Home, ArrowRight, Loader2, CloudCheck, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHomeworkStore } from '@/stores/homeworkStore';
import { useAuthStore } from '@/stores/authStore';
import { FINAL_EXAM_SECTION_META, type FinalExamSectionId } from '@/types/homework';
import { getQuestionsForFinalExamSection } from '@/data/homework/final-exam-questions';
import type { TranslationQuestion, MCQQuestion } from '@/types/homework';
import { cn } from '@/lib/utils';

export default function FinalExamCompletePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    finalExam,
    completeFinalExam,
    resetFinalExam,
    getOverallProgressFE,
    syncToCloudFE,
    submitResultFE,
    isSyncing,
  } = useHomeworkStore();

  const [hasSynced, setHasSynced] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'pending' | 'sending' | 'sent' | 'failed'>('pending');
  const progress = getOverallProgressFE();
  const sections: FinalExamSectionId[] = [1, 2, 3];

  useEffect(() => {
    const finalize = async () => {
      if (finalExam.status !== 'completed' && progress.completed === 3) {
        completeFinalExam();
      }

      // Cloud sync (requires Firebase auth)
      if (user && !hasSynced) {
        await syncToCloudFE(user.uid);
        await submitResultFE(user.uid, {
          displayName: finalExam.studentName || user.displayName,
          email: user.email,
        });
        setHasSynced(true);
      }

      // Email results to instructor (works with or without Firebase auth)
      if (emailStatus === 'pending') {
        setEmailStatus('sending');
        try {
          // Build MCQ answer details for sections 1 & 2
          const mcqAnswerDetails: { sectionId: number; questions: { questionId: string; question: string; options: string[]; correctIndex: number; studentAnswer: number; isCorrect: boolean }[] }[] = [];
          for (const sectionId of [1, 2] as const) {
            const questions = getQuestionsForFinalExamSection(sectionId) as MCQQuestion[];
            const answers = finalExam.sections[sectionId]?.answers || [];
            mcqAnswerDetails.push({
              sectionId,
              questions: questions.map((q) => {
                const answer = answers.find((a) => a.questionId === q.id);
                return {
                  questionId: q.id,
                  question: q.question,
                  options: q.options,
                  correctIndex: q.correctIndex,
                  studentAnswer: answer ? (answer.userAnswer as number) : -1,
                  isCorrect: answer?.isCorrect ?? false,
                };
              }),
            });
          }

          // Build translation answer details for section 3
          const section3Questions = getQuestionsForFinalExamSection(3) as TranslationQuestion[];
          const section3Answers = finalExam.sections[3]?.answers || [];
          const translationAnswers = section3Questions.map((q) => {
            const answer = section3Answers.find((a) => a.questionId === q.id);
            return {
              questionId: q.id,
              reference: q.reference,
              greek: q.greek,
              referenceTranslation: q.referenceTranslation,
              studentTranslation: (answer?.userAnswer as string) || '',
            };
          });

          const displayName = finalExam.studentName || user?.displayName || 'Unknown Student';

          const res = await fetch('/api/send-exam-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentName: displayName,
              studentEmail: user?.email || '',
              grammarScore: finalExam.sections[1]?.score || 0,
              grammarTotal: finalExam.sections[1]?.totalQuestions || 50,
              vocabScore: finalExam.sections[2]?.score || 0,
              vocabTotal: finalExam.sections[2]?.totalQuestions || 30,
              translationScore: finalExam.sections[3]?.score || 0,
              translationTotal: finalExam.sections[3]?.totalQuestions || 5,
              translationAnswers,
              mcqAnswers: mcqAnswerDetails,
              completedAt: new Date().toLocaleString(),
            }),
          });

          setEmailStatus(res.ok ? 'sent' : 'failed');
        } catch {
          setEmailStatus('failed');
        }
      }
    };

    finalize();
  }, [finalExam.status, finalExam.sections, finalExam.studentName, progress.completed, completeFinalExam, user, syncToCloudFE, submitResultFE, hasSynced, emailStatus]);

  const totalScore = (finalExam.sections[1]?.score || 0) + (finalExam.sections[2]?.score || 0) + (finalExam.sections[3]?.score || 0);
  const totalQuestions = (finalExam.sections[1]?.totalQuestions || 50) + (finalExam.sections[2]?.totalQuestions || 30) + (finalExam.sections[3]?.totalQuestions || 5);
  const percentage = totalQuestions > 0
    ? Math.round((totalScore / totalQuestions) * 100)
    : 0;
  const getGrade = () => {
    if (percentage >= 90) return { letter: 'A', color: 'text-green-500' };
    if (percentage >= 80) return { letter: 'B', color: 'text-blue-500' };
    if (percentage >= 70) return { letter: 'C', color: 'text-yellow-500' };
    if (percentage >= 60) return { letter: 'D', color: 'text-orange-500' };
    return { letter: 'F', color: 'text-red-500' };
  };
  const grade = getGrade();

  const handleRetry = async () => {
    resetFinalExam();
    if (user) {
      await syncToCloudFE(user.uid);
    }
    router.push('/homework/final-exam');
  };

  // handleRedoSection removed — review links used instead

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30">
              <GraduationCap className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold">Final Exam Complete!</h1>
            <p className="text-muted-foreground">
              {finalExam.studentName
                ? `Congratulations, ${finalExam.studentName}, on completing the Koine Greek Final Exam`
                : 'Congratulations on completing the Koine Greek Final Exam'}
            </p>
            {user && (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm">
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-muted-foreground">Saving results...</span>
                    </>
                  ) : hasSynced ? (
                    <>
                      <CloudCheck className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">Results saved to cloud</span>
                    </>
                  ) : null}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  {emailStatus === 'sending' && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-muted-foreground">Sending results to instructor...</span>
                    </>
                  )}
                  {emailStatus === 'sent' && (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">Results emailed to instructor</span>
                    </>
                  )}
                  {emailStatus === 'failed' && (
                    <span className="text-red-500">Failed to email results — your answers are saved in the cloud</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <Card className="overflow-hidden">
            <div className="h-2 bg-green-500" />
            <CardContent className="pt-8 pb-6 text-center">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    Your Grade
                  </p>
                  <p className={cn('text-7xl font-bold', grade.color)}>
                    {grade.letter}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-8 py-4 border-y">
                  <div>
                    <p className="text-3xl font-bold">{Number.isInteger(totalScore) ? totalScore : totalScore.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-3xl text-muted-foreground">/</div>
                  <div>
                    <p className="text-3xl font-bold">{totalQuestions}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="text-3xl text-muted-foreground">=</div>
                  <div>
                    <p className="text-3xl font-bold text-primary">{percentage}%</p>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  All sections auto-graded. Translations scored on key term coverage, semantic similarity, and completeness.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Section Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sections.map((sectionId) => {
                  const section = finalExam.sections[sectionId] ?? {
                    status: 'not_started' as const,
                    score: 0,
                    totalQuestions: 0,
                  };
                  const meta = FINAL_EXAM_SECTION_META[sectionId];
                  const sectionPercentage = section.totalQuestions > 0
                    ? Math.round((section.score / section.totalQuestions) * 100)
                    : 0;

                  return (
                    <div key={sectionId} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          <span className="font-medium truncate">{meta.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm">
                            {`${Number.isInteger(section.score) ? section.score : section.score.toFixed(1)}/${section.totalQuestions} (${sectionPercentage}%)`}
                          </span>
                          <Link href={`/homework/final-exam/section/${sectionId}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-muted-foreground hover:text-foreground"
                            >
                              Review
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            sectionPercentage >= 80
                              ? 'bg-green-500'
                              : sectionPercentage >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          )}
                          style={{ width: `${sectionPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-2">
                {percentage >= 90 && (
                  <>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      Outstanding Achievement!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You have demonstrated mastery of Koine Greek grammar, vocabulary, and translation.
                      Your understanding of noun declensions, verb conjugation, participles, and sentence
                      structure is excellent. You are well-prepared for reading the Greek New Testament!
                    </p>
                  </>
                )}
                {percentage >= 70 && percentage < 90 && (
                  <>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      Strong Performance!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You have a solid grasp of Koine Greek fundamentals. Review the sections where you
                      scored below 80% to strengthen your understanding. Pay special attention to verb
                      morphology, 3rd declension patterns, and participle usage.
                    </p>
                  </>
                )}
                {percentage < 70 && (
                  <>
                    <p className="font-semibold text-orange-600 dark:text-orange-400">
                      Keep Studying!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Greek grammar takes time to master. Review the homework sections that cover your
                      weaker areas. Focus on memorizing paradigm patterns, key vocabulary, and practice
                      translating simple verses before attempting longer passages.
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="outline" onClick={handleRetry} className="gap-2 w-full sm:w-auto">
              <RotateCcw className="w-4 h-4" />
              Retry Exam
            </Button>
            <Link href="/homework/final-exam" className="w-full sm:w-auto">
              <Button className="gap-2 w-full">
                Back to Final Exam Overview
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
