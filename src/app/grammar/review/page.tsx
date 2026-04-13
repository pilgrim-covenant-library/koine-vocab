'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ChevronRight, GraduationCap, CheckCircle, Dumbbell, ClipboardList, FileText } from 'lucide-react';
import { Fragment } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { REVIEW_WEEKS } from '@/data/review';

const weekColors = [
  'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
];

interface StoredScore {
  completed: boolean;
  score: number;
  total: number;
}

function getStoredScore(week: number, mode: string): StoredScore | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`review-week-${week}-${mode}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ScoreBadge({ week, mode }: { week: number; mode: string }) {
  const [score, setScore] = useState<StoredScore | null>(null);

  useEffect(() => {
    setScore(getStoredScore(week, mode));
  }, [week, mode]);

  if (!score?.completed) return null;

  return (
    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      <CheckCircle className="w-3.5 h-3.5" />
      {score.score}/{score.total}
    </span>
  );
}

export default function ReviewHubPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/grammar">
            <Button variant="ghost" size="icon" aria-label="Back to grammar">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Review Weeks</h1>
            <p className="text-xs text-muted-foreground">Master homework content</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 mb-4">
            <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Weeks 13–15: Mastery Practice</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Three review weeks covering all homework topics (HW 1–8).
            Each week has in-class practice with explanations and a separate homework set for independent drilling.
          </p>
        </div>

        <div className="space-y-6">
          {REVIEW_WEEKS.map((rw, idx) => (
            <Fragment key={rw.week}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-xl border font-bold text-lg shrink-0',
                      weekColors[idx],
                    )}
                  >
                    {rw.week}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{rw.title}</h3>
                    <p className="text-xs font-medium text-muted-foreground">{rw.subtitle}</p>
                    <p className="text-sm text-muted-foreground mt-1">{rw.description}</p>
                  </div>
                </div>

                {/* Topic tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {rw.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Two action buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/grammar/review/${rw.week}?mode=practice`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">In-Class Practice</p>
                          <p className="text-xs text-muted-foreground">{rw.inClass.length} questions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ScoreBadge week={rw.week} mode="practice" />
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  </Link>

                  <Link href={`/grammar/review/${rw.week}?mode=homework`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-amber-500" />
                        <div>
                          <p className="text-sm font-medium">Homework</p>
                          <p className="text-xs text-muted-foreground">{rw.homework.length} questions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ScoreBadge week={rw.week} mode="homework" />
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Practice Paper between Week 13 and Week 14 */}
            {idx === 0 && (
              <Link href="/grammar/review/practice-paper">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer group border-violet-500/30 border-dashed">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-violet-500/20 bg-violet-500/10 shrink-0">
                        <FileText className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">Practice Paper</h3>
                            <p className="text-xs font-medium text-violet-600 dark:text-violet-400">Mark 1 — Final Exam Format</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          50 grammar MCQ + 30 vocab MCQ + 5 verse analysis with translation. Tests everything from Mark 1.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
            </Fragment>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-muted/50 border">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            How to Use
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li><strong>In-Class Practice</strong> — Guided review with detailed explanations. Work through these together in class.</li>
            <li><strong>Homework</strong> — Independent drilling with parsing and form recognition. Complete on your own.</li>
            <li>Each week covers 2–3 homework assignments worth of material.</li>
            <li>Retake any section to improve your score — questions are shuffled each time.</li>
            <li>Aim for 80%+ before moving to the next review week.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
