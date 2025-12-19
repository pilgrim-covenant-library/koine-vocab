'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// Article paradigm data
const articleParadigm = {
  masculine: {
    singular: {
      nominative: 'ὁ',
      genitive: 'τοῦ',
      dative: 'τῷ',
      accusative: 'τόν',
    },
    plural: {
      nominative: 'οἱ',
      genitive: 'τῶν',
      dative: 'τοῖς',
      accusative: 'τούς',
    },
  },
  feminine: {
    singular: {
      nominative: 'ἡ',
      genitive: 'τῆς',
      dative: 'τῇ',
      accusative: 'τήν',
    },
    plural: {
      nominative: 'αἱ',
      genitive: 'τῶν',
      dative: 'ταῖς',
      accusative: 'τάς',
    },
  },
  neuter: {
    singular: {
      nominative: 'τό',
      genitive: 'τοῦ',
      dative: 'τῷ',
      accusative: 'τό',
    },
    plural: {
      nominative: 'τά',
      genitive: 'τῶν',
      dative: 'τοῖς',
      accusative: 'τά',
    },
  },
};

const cases = ['nominative', 'genitive', 'dative', 'accusative'] as const;

export default function ArticleParadigmHelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link
            href="/homework/hw1"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Homework</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">The Greek Article</h1>
              <p className="text-muted-foreground">
                All forms of ὁ, ἡ, τό ("the")
              </p>
            </div>
          </div>

          {/* Introduction */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm">
                The Greek definite article ("the") changes form based on <strong>gender</strong>,{' '}
                <strong>number</strong>, and <strong>case</strong>. Unlike English which only has
                "the," Greek has 24 different forms! Learning the article is essential because
                its endings appear in many other words (nouns, adjectives, pronouns).
              </p>
            </CardContent>
          </Card>

          {/* Full paradigm table */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Article Paradigm</CardTitle>
              <CardDescription>
                The definite article in all 24 forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-center">
                  <thead>
                    <tr>
                      <th className="p-2"></th>
                      <th colSpan={2} className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        Masculine
                      </th>
                      <th colSpan={2} className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                        Feminine
                      </th>
                      <th colSpan={2} className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        Neuter
                      </th>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 text-left">Case</th>
                      <th className="p-2 text-sm">Sing.</th>
                      <th className="p-2 text-sm">Plur.</th>
                      <th className="p-2 text-sm">Sing.</th>
                      <th className="p-2 text-sm">Plur.</th>
                      <th className="p-2 text-sm">Sing.</th>
                      <th className="p-2 text-sm">Plur.</th>
                    </tr>
                  </thead>
                  <tbody className="greek-text text-xl">
                    {cases.map((caseName) => (
                      <tr key={caseName} className="border-b last:border-0">
                        <td className="p-2 text-left font-sans text-sm font-medium capitalize">
                          {caseName}
                        </td>
                        <td className="p-2 bg-blue-50 dark:bg-blue-900/10">
                          {articleParadigm.masculine.singular[caseName]}
                        </td>
                        <td className="p-2 bg-blue-50 dark:bg-blue-900/10">
                          {articleParadigm.masculine.plural[caseName]}
                        </td>
                        <td className="p-2 bg-pink-50 dark:bg-pink-900/10">
                          {articleParadigm.feminine.singular[caseName]}
                        </td>
                        <td className="p-2 bg-pink-50 dark:bg-pink-900/10">
                          {articleParadigm.feminine.plural[caseName]}
                        </td>
                        <td className="p-2 bg-purple-50 dark:bg-purple-900/10">
                          {articleParadigm.neuter.singular[caseName]}
                        </td>
                        <td className="p-2 bg-purple-50 dark:bg-purple-900/10">
                          {articleParadigm.neuter.plural[caseName]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Patterns to notice */}
          <Card>
            <CardHeader>
              <CardTitle>Key Patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">Nominative forms are unique</p>
                  <div className="greek-text text-2xl flex gap-4 justify-center">
                    <span className="text-blue-600 dark:text-blue-400">ὁ / οἱ</span>
                    <span className="text-pink-600 dark:text-pink-400">ἡ / αἱ</span>
                    <span className="text-purple-600 dark:text-purple-400">τό / τά</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Only the nominative doesn't start with τ-
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">Genitive plural is the same</p>
                  <div className="greek-text text-2xl text-center">
                    <span className="text-primary">τῶν</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    All genders share τῶν in genitive plural
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">Masc & Neuter share forms</p>
                  <div className="greek-text text-lg">
                    <p>Genitive: <span className="text-primary">τοῦ</span> (both)</p>
                    <p>Dative: <span className="text-primary">τῷ / τοῖς</span> (both)</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Masculine and neuter are similar in genitive/dative
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">Neuter nom = acc</p>
                  <div className="greek-text text-lg">
                    <p>Singular: <span className="text-primary">τό = τό</span></p>
                    <p>Plural: <span className="text-primary">τά = τά</span></p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Neuter nominative and accusative are always identical
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual gender cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Masculine */}
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2 bg-blue-50 dark:bg-blue-900/20">
                <CardTitle className="text-blue-700 dark:text-blue-300">
                  Masculine
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-center">
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span></span>
                    <span className="text-muted-foreground">S</span>
                    <span className="text-muted-foreground">P</span>
                  </div>
                  {cases.map((c) => (
                    <div key={c} className="grid grid-cols-3 gap-1">
                      <span className="text-xs text-muted-foreground text-left capitalize">
                        {c.slice(0, 3)}
                      </span>
                      <span className="greek-text text-lg">
                        {articleParadigm.masculine.singular[c]}
                      </span>
                      <span className="greek-text text-lg">
                        {articleParadigm.masculine.plural[c]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feminine */}
            <Card className="border-2 border-pink-200 dark:border-pink-800">
              <CardHeader className="pb-2 bg-pink-50 dark:bg-pink-900/20">
                <CardTitle className="text-pink-700 dark:text-pink-300">
                  Feminine
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-center">
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span></span>
                    <span className="text-muted-foreground">S</span>
                    <span className="text-muted-foreground">P</span>
                  </div>
                  {cases.map((c) => (
                    <div key={c} className="grid grid-cols-3 gap-1">
                      <span className="text-xs text-muted-foreground text-left capitalize">
                        {c.slice(0, 3)}
                      </span>
                      <span className="greek-text text-lg">
                        {articleParadigm.feminine.singular[c]}
                      </span>
                      <span className="greek-text text-lg">
                        {articleParadigm.feminine.plural[c]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Neuter */}
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-2 bg-purple-50 dark:bg-purple-900/20">
                <CardTitle className="text-purple-700 dark:text-purple-300">
                  Neuter
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-center">
                  <div className="grid grid-cols-3 gap-1 text-sm">
                    <span></span>
                    <span className="text-muted-foreground">S</span>
                    <span className="text-muted-foreground">P</span>
                  </div>
                  {cases.map((c) => (
                    <div key={c} className="grid grid-cols-3 gap-1">
                      <span className="text-xs text-muted-foreground text-left capitalize">
                        {c.slice(0, 3)}
                      </span>
                      <span className="greek-text text-lg">
                        {articleParadigm.neuter.singular[c]}
                      </span>
                      <span className="greek-text text-lg">
                        {articleParadigm.neuter.plural[c]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Memory tip */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Study Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  <span>
                    <strong>Learn nominative forms first</strong> — ὁ, ἡ, τό are unique and most common
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  <span>
                    <strong>Notice the τ- pattern</strong> — Most forms start with τ except nominative
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  <span>
                    <strong>Focus on endings</strong> — The endings (-ου, -ῳ, -ον, etc.) reappear in nouns
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">4.</span>
                  <span>
                    <strong>Practice with real texts</strong> — Seeing articles in context helps memory
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
