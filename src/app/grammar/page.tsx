'use client';

import Link from 'next/link';
import { ArrowLeft, Search, Table2, Dumbbell, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface GrammarModeCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

function GrammarModeCard({ title, description, icon: Icon, href, color }: GrammarModeCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  };

  return (
    <Link href={href}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer group h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-xl', colorClasses[color] || colorClasses.blue)}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{title}</h3>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function GrammarPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="Back to dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Grammar</h1>
            <p className="text-xs text-muted-foreground">Master Greek morphology</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Intro */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 mb-4">
            <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Greek Grammar Tools</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Explore noun declensions, verb conjugations, and practice parsing Greek words.
          </p>
        </div>

        {/* Grammar modes */}
        <div className="space-y-4">
          <GrammarModeCard
            title="Word Parser"
            description="Look up any Greek word and see its full morphological breakdown"
            icon={Search}
            href="/grammar/parser"
            color="blue"
          />

          <GrammarModeCard
            title="Paradigm Tables"
            description="Study noun declensions, verb conjugations, and pronoun forms"
            icon={Table2}
            href="/grammar/tables"
            color="purple"
          />

          <GrammarModeCard
            title="Practice Parsing"
            description="Test your ability to identify cases, tenses, moods, and more"
            icon={Dumbbell}
            href="/grammar/practice"
            color="emerald"
          />
        </div>

        {/* Quick reference */}
        <div className="mt-8 p-4 rounded-xl bg-muted/50 border">
          <h3 className="font-semibold mb-3">Quick Reference</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground mb-1">5 Cases</p>
              <p>Nominative, Genitive, Dative, Accusative, Vocative</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-1">6 Tenses</p>
              <p>Present, Imperfect, Future, Aorist, Perfect, Pluperfect</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-1">3 Voices</p>
              <p>Active, Middle, Passive</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-1">4 Moods</p>
              <p>Indicative, Subjunctive, Optative, Imperative</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
