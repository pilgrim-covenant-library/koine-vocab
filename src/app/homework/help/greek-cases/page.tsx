'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

const cases = [
  {
    name: 'Nominative',
    function: 'Subject of the verb',
    question: 'Who? What? (performs the action)',
    color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
    englishExample: 'The man loves God.',
    greekExample: 'ὁ ἄνθρωπος ἀγαπᾷ τὸν θεόν.',
    highlight: 'ὁ ἄνθρωπος',
    explanation: 'The nominative identifies who is doing the action. "The man" is the subject.',
  },
  {
    name: 'Genitive',
    function: 'Possession, source, or separation',
    question: 'Whose? Of what? From where?',
    color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
    englishExample: 'The son of God came.',
    greekExample: 'ὁ υἱὸς τοῦ θεοῦ ἦλθεν.',
    highlight: 'τοῦ θεοῦ',
    explanation: 'The genitive shows possession or relationship. "Of God" describes whose son.',
  },
  {
    name: 'Dative',
    function: 'Indirect object, means, or location',
    question: 'To whom? For whom? With what?',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
    englishExample: 'He gives the book to the man.',
    greekExample: 'δίδωσιν τὸ βιβλίον τῷ ἀνθρώπῳ.',
    highlight: 'τῷ ἀνθρώπῳ',
    explanation: 'The dative shows the indirect object — who receives something indirectly.',
  },
  {
    name: 'Accusative',
    function: 'Direct object of the verb',
    question: 'Whom? What? (receives the action)',
    color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
    englishExample: 'God loves the world.',
    greekExample: 'ὁ θεὸς ἀγαπᾷ τὸν κόσμον.',
    highlight: 'τὸν κόσμον',
    explanation: 'The accusative shows the direct object — what directly receives the action.',
  },
  {
    name: 'Vocative',
    function: 'Direct address',
    question: 'O...! (calling someone)',
    color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
    englishExample: 'Lord, help me!',
    greekExample: 'Κύριε, βοήθει μοι!',
    highlight: 'Κύριε',
    explanation: 'The vocative is used when directly addressing or calling someone.',
  },
];

export default function GreekCasesHelpPage() {
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
              <h1 className="text-2xl font-bold">Greek Cases</h1>
              <p className="text-muted-foreground">
                The five cases used in Koine Greek
              </p>
            </div>
          </div>

          {/* Introduction */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm">
                Greek is an <strong>inflected language</strong>, meaning word endings change
                to show their function in a sentence. English uses word order ("The man
                sees the dog" vs "The dog sees the man"), but Greek uses case endings.
                The same Greek sentence could have words in different orders but mean the
                same thing because the endings tell you who does what.
              </p>
            </CardContent>
          </Card>

          {/* Cases */}
          <div className="space-y-4">
            {cases.map((c, index) => (
              <Card key={index} className={`border-2 ${c.color}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{c.name}</CardTitle>
                    <span className="text-sm font-medium text-muted-foreground">
                      Case #{index + 1}
                    </span>
                  </div>
                  <CardDescription className="text-base font-medium">
                    {c.function}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Question */}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Ask:</span>
                    <span className="font-medium italic">"{c.question}"</span>
                  </div>

                  {/* Examples */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        English
                      </p>
                      <p className="text-sm">{c.englishExample}</p>
                    </div>
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Greek
                      </p>
                      <p className="text-sm greek-text">{c.greekExample}</p>
                      <p className="text-xs text-primary mt-1">
                        {c.name}: <span className="greek-text font-medium">{c.highlight}</span>
                      </p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <p className="text-sm text-muted-foreground">
                    {c.explanation}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">Case</th>
                      <th className="text-left py-2 px-3 font-medium">Function</th>
                      <th className="text-left py-2 px-3 font-medium">Key Question</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-3 font-medium text-blue-600 dark:text-blue-400">Nominative</td>
                      <td className="py-2 px-3">Subject</td>
                      <td className="py-2 px-3 text-muted-foreground">Who/What does it?</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3 font-medium text-green-600 dark:text-green-400">Genitive</td>
                      <td className="py-2 px-3">Possession ("of")</td>
                      <td className="py-2 px-3 text-muted-foreground">Whose? Of what?</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3 font-medium text-yellow-600 dark:text-yellow-400">Dative</td>
                      <td className="py-2 px-3">Indirect object ("to/for")</td>
                      <td className="py-2 px-3 text-muted-foreground">To/For whom?</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3 font-medium text-orange-600 dark:text-orange-400">Accusative</td>
                      <td className="py-2 px-3">Direct object</td>
                      <td className="py-2 px-3 text-muted-foreground">Whom/What receives?</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-purple-600 dark:text-purple-400">Vocative</td>
                      <td className="py-2 px-3">Direct address</td>
                      <td className="py-2 px-3 text-muted-foreground">O...! (calling)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Memory tip */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Memory Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Think of a sentence like "<strong>The teacher gives the book to the student</strong>":
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• <strong className="text-blue-600 dark:text-blue-400">Nominative</strong>: "The teacher" (who gives)</li>
                <li>• <strong className="text-orange-600 dark:text-orange-400">Accusative</strong>: "the book" (what is given)</li>
                <li>• <strong className="text-yellow-600 dark:text-yellow-400">Dative</strong>: "to the student" (who receives)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
