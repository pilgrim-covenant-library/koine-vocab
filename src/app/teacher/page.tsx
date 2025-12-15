'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getTeacherStudents, getProgressFromCloud, type AppUser } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StudentWithProgress extends AppUser {
  progress?: {
    wordsLearned: number;
    totalReviews: number;
    accuracy: number;
    streak: number;
    level: number;
    xp: number;
    lastActive: Date | null;
  };
}

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [students, setStudents] = useState<StudentWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      router.push('/');
      return;
    }

    if (user?.role === 'teacher') {
      loadStudents();
    }
  }, [user, authLoading, router]);

  const loadStudents = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const studentList = await getTeacherStudents(user.uid);

      // Load progress for each student
      const studentsWithProgress: StudentWithProgress[] = await Promise.all(
        studentList.map(async (student) => {
          const progressData = await getProgressFromCloud(student.uid);
          return {
            ...student,
            progress: progressData
              ? {
                  wordsLearned: progressData.stats.wordsLearned || 0,
                  totalReviews: progressData.stats.totalReviews || 0,
                  accuracy:
                    progressData.stats.totalReviews > 0
                      ? Math.round(
                          (progressData.stats.correctReviews /
                            progressData.stats.totalReviews) *
                            100
                        )
                      : 0,
                  streak: progressData.stats.streak || 0,
                  level: progressData.stats.level || 1,
                  xp: progressData.stats.xp || 0,
                  lastActive: progressData.stats.lastStudyDate
                    ? new Date(progressData.stats.lastStudyDate)
                    : null,
                }
              : undefined,
          };
        })
      );

      setStudents(studentsWithProgress);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyTeacherId = async () => {
    if (!user) return;
    await navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLastActive = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (authLoading || isLoading) {
    return <TeacherSkeleton />;
  }

  if (!user || user.role !== 'teacher') {
    return null;
  }

  // Calculate aggregate stats
  const totalStudents = students.length;
  const activeStudents = students.filter(
    (s) => s.progress?.lastActive && new Date().getTime() - s.progress.lastActive.getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;
  const avgAccuracy =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => sum + (s.progress?.accuracy || 0), 0) / students.length
        )
      : 0;
  const totalWordsLearned = students.reduce((sum, s) => sum + (s.progress?.wordsLearned || 0), 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Teacher Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Teacher ID sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Teacher ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Share this ID with students so they can link their accounts to you.
            </p>
            <div className="flex gap-2">
              <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm truncate">
                {user.uid}
              </code>
              <Button variant="outline" size="icon" onClick={copyTeacherId}>
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Class stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeStudents}</p>
                <p className="text-xs text-muted-foreground">Active This Week</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgAccuracy}%</p>
                <p className="text-xs text-muted-foreground">Avg Accuracy</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalWordsLearned}</p>
                <p className="text-xs text-muted-foreground">Words Learned</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Student list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5" />
              Students ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No students yet</p>
                <p className="text-sm mt-1">
                  Share your Teacher ID with students to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <Link
                    key={student.uid}
                    href={`/teacher/student/${student.uid}`}
                    className="block"
                  >
                    <div
                      className={cn(
                        'p-4 rounded-xl border transition-all',
                        'hover:border-primary/50 hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">
                              {student.displayName?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{student.displayName || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      {student.progress && (
                        <div className="mt-3 pt-3 border-t grid grid-cols-4 gap-2 text-center">
                          <div>
                            <p className="text-sm font-bold text-purple-500">
                              Lv.{student.progress.level}
                            </p>
                            <p className="text-xs text-muted-foreground">Level</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-emerald-500">
                              {student.progress.wordsLearned}
                            </p>
                            <p className="text-xs text-muted-foreground">Words</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold">
                              {student.progress.accuracy}%
                            </p>
                            <p className="text-xs text-muted-foreground">Accuracy</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-orange-500">
                              {student.progress.streak}
                            </p>
                            <p className="text-xs text-muted-foreground">Streak</p>
                          </div>
                        </div>
                      )}
                      {!student.progress && (
                        <p className="mt-3 pt-3 border-t text-sm text-muted-foreground text-center">
                          No activity yet
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Last active: {formatLastActive(student.progress?.lastActive ?? null)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function TeacherSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="border-b p-4">
        <div className="h-8 w-48 bg-muted rounded" />
      </header>
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <div className="h-32 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </main>
    </div>
  );
}
