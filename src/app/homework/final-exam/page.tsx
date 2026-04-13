'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Lock, Loader2, RotateCcw, GraduationCap, AlertCircle, BookOpen, Brain, Languages } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHomeworkStore } from '@/stores/homeworkStore';
import { useAuthStore } from '@/stores/authStore';
import { FINAL_EXAM_SECTION_META, type FinalExamSectionId } from '@/types/homework';
import { cn } from '@/lib/utils';

function PasswordGate({ onUnlock }: { onUnlock: (name: string) => void }) {
  const [step, setStep] = useState<'code' | 'name'>('code');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState(false);
  const [nameError, setNameError] = useState(false);

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase().trim() === 'koine') {
      setStep('name');
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = studentName.trim();
    if (trimmed.length < 2) {
      setNameError(true);
      return;
    }
    onUnlock(trimmed);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
            {step === 'code' ? (
              <Lock className="w-8 h-8 text-primary" />
            ) : (
              <GraduationCap className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">Final Exam</CardTitle>
          <CardDescription>
            {step === 'code'
              ? 'Enter the access code provided by your instructor to begin the final exam.'
              : 'Enter your full name as it should appear on your exam submission.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'code' ? (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  placeholder="Enter access code..."
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border bg-background text-center text-lg tracking-widest',
                    'focus:outline-none focus:ring-2 focus:ring-primary',
                    error && 'border-red-500 focus:ring-red-500'
                  )}
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-red-500 text-center mt-2">
                    Incorrect access code. Please try again.
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full gap-2" size="lg">
                <Lock className="w-4 h-4" />
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => { setStudentName(e.target.value); setNameError(false); }}
                  placeholder="Your full name..."
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border bg-background text-center text-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary',
                    nameError && 'border-red-500 focus:ring-red-500'
                  )}
                  autoFocus
                />
                {nameError && (
                  <p className="text-sm text-red-500 text-center mt-2">
                    Please enter your full name (at least 2 characters).
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full gap-2" size="lg">
                <ArrowRight className="w-4 h-4" />
                Begin Exam
              </Button>
            </form>
          )}
          <div className="mt-6 text-center">
            <Link href="/homework" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Homework
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinalExamContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    finalExam,
    startFinalExam,
    startTimerFE,
    loadFromCloudFE,
    syncToCloudFE,
    resetFinalExam,
  } = useHomeworkStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeExam = async () => {
      if (user) await loadFromCloudFE(user.uid);
      if (finalExam.status === 'not_started') startFinalExam();
      if (user) await syncToCloudFE(user.uid);
      setIsLoading(false);
    };
    initializeExam();
  }, [user, finalExam.status, startFinalExam, loadFromCloudFE, syncToCloudFE]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading final exam...</p>
        </div>
      </div>
    );
  }

  const isSubmitted = Boolean(finalExam.submittedAt);
  const timerRunning = Boolean(finalExam.timerStartedAt) && !isSubmitted;

  const handleBeginExam = () => {
    startTimerFE();
    router.push('/homework/final-exam/section/1');
  };

  const handleResumeExam = () => {
    // Find first section with unanswered questions
    for (const sectionId of [1, 2, 3] as FinalExamSectionId[]) {
      const section = finalExam.sections[sectionId];
      if (section.answers.length < section.totalQuestions) {
        router.push(`/homework/final-exam/section/${sectionId}`);
        return;
      }
    }
    // All answered, go to review
    router.push('/homework/final-exam/review');
  };

  const handleRetryExam = async () => {
    resetFinalExam();
    if (user) await syncToCloudFE(user.uid);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/homework" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Homework</span>
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm font-medium">Final Exam</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Final Exam</h1>
            <p className="text-muted-foreground">Comprehensive Assessment — Koine Greek</p>
          </div>

          {/* Exam Instructions */}
          {!isSubmitted && !timerRunning && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Exam Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">60 minutes</p>
                      <p className="text-sm text-muted-foreground">The timer starts when you click &quot;Begin Exam&quot; and cannot be paused. The exam auto-submits when time expires.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">85 questions across 3 sections (100 points)</p>
                      <p className="text-sm text-muted-foreground">50 Grammar MCQ (50 pts) + 30 Vocabulary MCQ (30 pts) + 5 Verse Analysis (20 pts: matching + translation)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Negative marking on MCQs</p>
                      <p className="text-sm text-muted-foreground">Correct = +1, Wrong = -0.5, &quot;I don&apos;t know&quot; = 0. If unsure, it&apos;s better to skip than guess blindly. No feedback shown until after submission.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Languages className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Free navigation</p>
                      <p className="text-sm text-muted-foreground">Move freely between questions and sections. Use the question grid to jump to any question. Answers save automatically.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {([1, 2, 3] as FinalExamSectionId[]).map((sectionId) => {
                  const meta = FINAL_EXAM_SECTION_META[sectionId];
                  const section = finalExam.sections[sectionId];
                  const answered = section.answers.length;

                  return (
                    <div key={sectionId} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium',
                        isSubmitted && 'bg-green-500 text-white',
                        !isSubmitted && answered === section.totalQuestions && 'bg-primary text-primary-foreground',
                        !isSubmitted && answered < section.totalQuestions && 'bg-muted text-muted-foreground',
                      )}>
                        {isSubmitted ? <CheckCircle className="w-4 h-4" /> : sectionId}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{meta.title}</p>
                        <p className="text-xs text-muted-foreground">{meta.questionCount} questions</p>
                      </div>
                      {isSubmitted && (
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          {Number.isInteger(section.score) ? section.score : section.score.toFixed(1)}/{sectionId === 3 ? 20 : section.totalQuestions}
                        </p>
                      )}
                      {timerRunning && (
                        <p className="text-xs text-muted-foreground">
                          {answered}/{meta.questionCount} answered
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col items-center gap-3">
            {isSubmitted ? (
              <>
                <Link href="/homework/final-exam/complete">
                  <Button size="lg" className="gap-2">
                    <CheckCircle className="w-5 h-5" />
                    View Results
                  </Button>
                </Link>
                <Button variant="outline" size="lg" onClick={handleRetryExam} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Retry Exam
                </Button>
              </>
            ) : timerRunning ? (
              <Button size="lg" onClick={handleResumeExam} className="gap-2">
                Resume Exam
                <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button size="lg" onClick={handleBeginExam} className="gap-2">
                Begin Exam
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function FinalExamPage() {
  const { finalExam, unlockFinalExam, setStudentNameFE } = useHomeworkStore();

  const handleUnlock = (name: string) => {
    setStudentNameFE(name);
    unlockFinalExam();
  };

  if (!finalExam.unlocked) {
    return <PasswordGate onUnlock={handleUnlock} />;
  }

  return <FinalExamContent />;
}
