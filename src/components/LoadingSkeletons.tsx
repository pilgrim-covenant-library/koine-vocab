'use client';

import { cn } from '@/lib/utils';

// Base skeleton component
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-hidden="true"
    />
  );
}

// Card skeleton for dashboard cards
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-xl border bg-card p-6 space-y-4', className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

// Session page skeleton (flashcards, quiz, typing)
export function SessionSkeleton() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse" role="status" aria-label="Loading session">
      {/* Header skeleton */}
      <header className="border-b p-4">
        <div className="max-w-md mx-auto">
          <Skeleton className="h-4 w-24 mx-auto mb-2" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="flex-1 flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-md space-y-6">
          {/* XP bar skeleton */}
          <Skeleton className="h-8 w-full" />

          {/* Card skeleton */}
          <div className="rounded-2xl border bg-card p-8 space-y-4">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-12 w-48 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
            <div className="flex justify-center gap-2 pt-4">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          </div>

          {/* Action area skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>

          {/* Button skeleton */}
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </main>

      {/* Footer skeleton */}
      <footer className="border-t p-4">
        <div className="flex justify-center gap-8">
          <div className="text-center space-y-1">
            <Skeleton className="h-6 w-8 mx-auto" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-6 w-8 mx-auto" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-6 w-8 mx-auto" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </footer>

      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen animate-pulse" role="status" aria-label="Loading dashboard">
      {/* Header skeleton */}
      <header className="border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-4 space-y-6">
        {/* XP bar */}
        <Skeleton className="h-12 w-full max-w-md mx-auto" />

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Learning modes */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </main>

      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Vocabulary browser skeleton
export function VocabularySkeleton() {
  return (
    <div className="min-h-screen animate-pulse" role="status" aria-label="Loading vocabulary">
      <header className="border-b p-4">
        <Skeleton className="h-6 w-32" />
      </header>

      <main className="container mx-auto p-4 space-y-4">
        {/* Search bar */}
        <Skeleton className="h-10 w-full max-w-md" />

        {/* Filters */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>

        {/* Word list */}
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-24" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </main>

      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Progress page skeleton
export function ProgressSkeleton() {
  return (
    <div className="min-h-screen animate-pulse" role="status" aria-label="Loading progress">
      <header className="border-b p-4">
        <Skeleton className="h-6 w-32" />
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Heatmap placeholder */}
        <CardSkeleton className="h-48" />

        {/* Session history */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </main>

      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Auth page skeleton (login/signup)
export function AuthSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-pulse" role="status" aria-label="Loading">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        <div className="border rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
}
