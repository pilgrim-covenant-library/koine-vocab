'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

const grammarTerms = [
  {
    term: 'Noun',
    definition: 'A word that names a person, place, thing, or idea.',
    englishExample: 'man, city, book, love',
    greekExample: 'ἄνθρωπος (man), πόλις (city), λόγος (word)',
    tip: 'Ask "What is it?" or "Who is it?"',
  },
  {
    term: 'Verb',
    definition: 'A word that expresses action, occurrence, or state of being.',
    englishExample: 'run, think, is, became',
    greekExample: 'λέγω (I say), εἰμί (I am), ἔρχομαι (I come)',
    tip: 'Ask "What is happening?" or "What does it do?"',
  },
  {
    term: 'Adjective',
    definition: 'A word that describes or modifies a noun.',
    englishExample: 'good, holy, great, small',
    greekExample: 'ἀγαθός (good), ἅγιος (holy), μέγας (great)',
    tip: 'Ask "What kind?" or "Which one?"',
  },
  {
    term: 'Adverb',
    definition: 'A word that modifies a verb, adjective, or other adverb.',
    englishExample: 'quickly, truly, very, now',
    greekExample: 'ἀληθῶς (truly), νῦν (now), οὕτως (thus)',
    tip: 'Ask "How?" "When?" "Where?" or "To what extent?"',
  },
  {
    term: 'Pronoun',
    definition: 'A word that replaces a noun to avoid repetition.',
    englishExample: 'I, you, he, she, it, we, they',
    greekExample: 'ἐγώ (I), σύ (you), αὐτός (he/she/it)',
    tip: 'Pronouns stand in for nouns already mentioned',
  },
  {
    term: 'Article',
    definition: 'A small word that indicates definiteness (specificity) of a noun.',
    englishExample: 'the (definite), a/an (indefinite)',
    greekExample: 'ὁ, ἡ, τό (the) — Greek has no indefinite article',
    tip: 'Greek only has "the" — no word for "a/an"',
  },
  {
    term: 'Preposition',
    definition: 'A word that shows the relationship between a noun and other words.',
    englishExample: 'in, on, with, from, to, through',
    greekExample: 'ἐν (in), ἐκ (out of), διά (through), πρός (to)',
    tip: 'Prepositions often relate to location or direction',
  },
  {
    term: 'Conjunction',
    definition: 'A word that connects words, phrases, or clauses.',
    englishExample: 'and, but, or, for, because',
    greekExample: 'καί (and), ἀλλά (but), γάρ (for), ὅτι (that/because)',
    tip: 'Conjunctions are "joining words"',
  },
  {
    term: 'Participle',
    definition: 'A verb form that functions as an adjective (verbal adjective).',
    englishExample: 'running (man), written (word), having loved',
    greekExample: 'λέγων (saying), γράψας (having written)',
    tip: 'Often translated with "-ing" or "-ed" in English',
  },
  {
    term: 'Particle',
    definition: 'A small invariable word that adds nuance or emphasis to a sentence.',
    englishExample: 'not, indeed, therefore',
    greekExample: 'οὐ/μή (not), μέν (indeed), οὖν (therefore)',
    tip: 'Particles don\'t change form and modify meaning',
  },
];

export default function GrammarTermsHelpPage() {
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
              <h1 className="text-2xl font-bold">Grammar Terms</h1>
              <p className="text-muted-foreground">
                The parts of speech used in Greek grammar
              </p>
            </div>
          </div>

          {/* Introduction */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm">
                Understanding English grammar terminology is essential for learning Greek.
                These terms describe the role words play in a sentence. Greek uses the same
                parts of speech as English, though they may behave differently.
              </p>
            </CardContent>
          </Card>

          {/* Grammar terms */}
          <div className="grid gap-4">
            {grammarTerms.map((item, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.term}</CardTitle>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                  </div>
                  <CardDescription className="text-base">
                    {item.definition}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        English Examples
                      </p>
                      <p>{item.englishExample}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Greek Examples
                      </p>
                      <p className="greek-text">{item.greekExample}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">💡</span>
                    <span>{item.tip}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary diagram */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="font-medium text-primary">Content Words</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <strong>Nouns</strong> — name things</li>
                    <li>• <strong>Verbs</strong> — express action</li>
                    <li>• <strong>Adjectives</strong> — describe nouns</li>
                    <li>• <strong>Adverbs</strong> — modify verbs/adj</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-primary">Function Words</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <strong>Articles</strong> — specify nouns</li>
                    <li>• <strong>Pronouns</strong> — replace nouns</li>
                    <li>• <strong>Prepositions</strong> — show relationships</li>
                    <li>• <strong>Conjunctions</strong> — connect elements</li>
                  </ul>
                </div>
                <div className="sm:col-span-2 space-y-2 pt-2 border-t">
                  <p className="font-medium text-primary">Special Forms</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <strong>Participles</strong> — verbal adjectives (combine verb + adjective features)</li>
                    <li>• <strong>Particles</strong> — small words adding nuance or emphasis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
