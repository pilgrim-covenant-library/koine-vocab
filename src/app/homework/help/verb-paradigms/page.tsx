'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

// Verb paradigm data - all 5 paradigms from Homework 3
const verbParadigms = {
  presentActiveLuo: {
    name: 'Present Active Indicative',
    verb: 'λύω',
    meaning: 'I loose/destroy',
    tenseInfo: 'Ongoing or repeated action in present time',
    singular: {
      first: 'λύω',
      second: 'λύεις',
      third: 'λύει',
    },
    plural: {
      first: 'λύομεν',
      second: 'λύετε',
      third: 'λύουσι(ν)',
    },
    endings: {
      singular: ['-ω', '-εις', '-ει'],
      plural: ['-ομεν', '-ετε', '-ουσι(ν)'],
    },
  },
  imperfectActiveLuo: {
    name: 'Imperfect Active Indicative',
    verb: 'ἔλυον',
    meaning: 'I was loosing/used to loose',
    tenseInfo: 'Ongoing or repeated action in past time',
    singular: {
      first: 'ἔλυον',
      second: 'ἔλυες',
      third: 'ἔλυε(ν)',
    },
    plural: {
      first: 'ἐλύομεν',
      second: 'ἐλύετε',
      third: 'ἔλυον',
    },
    endings: {
      singular: ['-ον', '-ες', '-ε(ν)'],
      plural: ['-ομεν', '-ετε', '-ον'],
    },
  },
  presentActiveEimi: {
    name: 'Present Active Indicative',
    verb: 'εἰμί',
    meaning: 'I am',
    tenseInfo: 'State of being in present time (irregular verb)',
    singular: {
      first: 'εἰμί',
      second: 'εἶ',
      third: 'ἐστί(ν)',
    },
    plural: {
      first: 'ἐσμέν',
      second: 'ἐστέ',
      third: 'εἰσί(ν)',
    },
    endings: null, // Irregular - no regular endings
  },
  imperfectActiveEimi: {
    name: 'Imperfect Active Indicative',
    verb: 'ἤμην',
    meaning: 'I was',
    tenseInfo: 'State of being in past time (irregular verb)',
    singular: {
      first: 'ἤμην',
      second: 'ἦς',
      third: 'ἦν',
    },
    plural: {
      first: 'ἦμεν',
      second: 'ἦτε',
      third: 'ἦσαν',
    },
    endings: null, // Irregular - no regular endings
  },
  firstAoristActiveLuo: {
    name: 'First Aorist Active Indicative',
    verb: 'ἔλυσα',
    meaning: 'I loosed (simple past)',
    tenseInfo: 'Simple/undefined action in past time',
    singular: {
      first: 'ἔλυσα',
      second: 'ἔλυσας',
      third: 'ἔλυσε(ν)',
    },
    plural: {
      first: 'ἐλύσαμεν',
      second: 'ἐλύσατε',
      third: 'ἔλυσαν',
    },
    endings: {
      singular: ['-α', '-ας', '-ε(ν)'],
      plural: ['-αμεν', '-ατε', '-αν'],
    },
  },
};

const persons = ['first', 'second', 'third'] as const;
const personLabels = { first: '1st', second: '2nd', third: '3rd' };

interface VerbParadigm {
  name: string;
  verb: string;
  meaning: string;
  tenseInfo: string;
  singular: { first: string; second: string; third: string };
  plural: { first: string; second: string; third: string };
  endings: { singular: string[]; plural: string[] } | null;
}

function ParadigmTable({ paradigm, colorClass }: { paradigm: VerbParadigm; colorClass: string }) {
  return (
    <Card className={`border-2 ${colorClass}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{paradigm.name}</CardTitle>
        <CardDescription>
          <span className="greek-text text-xl">{paradigm.verb}</span> — {paradigm.meaning}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3 italic">{paradigm.tenseInfo}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left text-sm">Person</th>
                <th className="p-2 text-sm">Singular</th>
                <th className="p-2 text-sm">Plural</th>
              </tr>
            </thead>
            <tbody className="greek-text text-lg">
              {persons.map((person) => (
                <tr key={person} className="border-b last:border-0">
                  <td className="p-2 text-left font-sans text-sm">{personLabels[person]}</td>
                  <td className="p-2">{paradigm.singular[person]}</td>
                  <td className="p-2">{paradigm.plural[person]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paradigm.endings && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-1">Endings:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Sing:</span>{' '}
                <span className="greek-text">{paradigm.endings.singular.join(', ')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Plur:</span>{' '}
                <span className="greek-text">{paradigm.endings.plural.join(', ')}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerbParadigmsHelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link
            href="/homework/hw3"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Homework</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-8">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Greek Verb Paradigms</h1>
              <p className="text-muted-foreground">
                Present, Imperfect, and Aorist tense forms
              </p>
            </div>
          </div>

          {/* Introduction */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm">
                Greek verbs change form based on <strong>person</strong> (1st, 2nd, 3rd),{' '}
                <strong>number</strong> (singular, plural), <strong>tense</strong> (time of action),{' '}
                <strong>voice</strong> (active, middle, passive), and <strong>mood</strong>{' '}
                (indicative, subjunctive, etc.). This page covers the most common indicative active
                forms you'll encounter in the New Testament.
              </p>
            </CardContent>
          </Card>

          {/* Tense Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Understanding Greek Tenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Present</p>
                  <p className="text-sm text-muted-foreground">
                    Ongoing or repeated action. "I am loosing" or "I loose (regularly)"
                  </p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="font-medium text-amber-700 dark:text-amber-300 mb-1">Imperfect</p>
                  <p className="text-sm text-muted-foreground">
                    Ongoing action in the past. "I was loosing" or "I used to loose"
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-medium text-green-700 dark:text-green-300 mb-1">Aorist</p>
                  <p className="text-sm text-muted-foreground">
                    Simple past action. "I loosed" — undefined aspect, just happened
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* λύω Paradigms */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="greek-text text-2xl">λύω</span>
              <span className="text-muted-foreground font-normal text-base">— "I loose/destroy"</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <ParadigmTable
                paradigm={verbParadigms.presentActiveLuo}
                colorClass="border-blue-200 dark:border-blue-800"
              />
              <ParadigmTable
                paradigm={verbParadigms.imperfectActiveLuo}
                colorClass="border-amber-200 dark:border-amber-800"
              />
              <ParadigmTable
                paradigm={verbParadigms.firstAoristActiveLuo}
                colorClass="border-green-200 dark:border-green-800"
              />
            </div>
          </div>

          {/* εἰμί Paradigms */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="greek-text text-2xl">εἰμί</span>
              <span className="text-muted-foreground font-normal text-base">— "I am" (irregular)</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <ParadigmTable
                paradigm={verbParadigms.presentActiveEimi}
                colorClass="border-purple-200 dark:border-purple-800"
              />
              <ParadigmTable
                paradigm={verbParadigms.imperfectActiveEimi}
                colorClass="border-pink-200 dark:border-pink-800"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3 italic">
              Note: εἰμί is highly irregular and must be memorized separately. It has no aorist tense
              — Greek uses a different verb (γίνομαι) for "became."
            </p>
          </div>

          {/* Key Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Key Patterns to Notice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">The Augment (ἐ-)</p>
                  <p className="text-sm text-muted-foreground">
                    Past tenses (imperfect, aorist) add an <span className="greek-text">ἐ-</span> prefix
                    called the "augment" to show past time:{' '}
                    <span className="greek-text">λύω → ἔλυον</span>
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">The Sigma (σ)</p>
                  <p className="text-sm text-muted-foreground">
                    First aorist adds a <span className="greek-text">σ</span> before the ending:{' '}
                    <span className="greek-text">ἔλυον → ἔλυσα</span>. This marks it as aorist tense.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">1st & 3rd Plural Imperfect</p>
                  <p className="text-sm text-muted-foreground">
                    In the imperfect, 1st singular and 3rd plural are identical:{' '}
                    <span className="greek-text">ἔλυον</span>. Context determines which is meant.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">The Movable Nu (ν)</p>
                  <p className="text-sm text-muted-foreground">
                    Some forms have an optional <span className="greek-text">(ν)</span> that appears
                    before vowels or at sentence end:{' '}
                    <span className="greek-text">λύει / λύειν</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Endings Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Primary vs Secondary Endings</CardTitle>
              <CardDescription>
                Present tense uses "primary" endings; past tenses use "secondary" endings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2"></th>
                      <th colSpan={2} className="p-2 bg-blue-100 dark:bg-blue-900/30">
                        Primary (Present)
                      </th>
                      <th colSpan={2} className="p-2 bg-amber-100 dark:bg-amber-900/30">
                        Secondary (Past)
                      </th>
                    </tr>
                    <tr className="border-b">
                      <th className="p-2 text-left">Person</th>
                      <th className="p-2">Sing.</th>
                      <th className="p-2">Plur.</th>
                      <th className="p-2">Sing.</th>
                      <th className="p-2">Plur.</th>
                    </tr>
                  </thead>
                  <tbody className="greek-text">
                    <tr className="border-b">
                      <td className="p-2 text-left font-sans">1st</td>
                      <td className="p-2 bg-blue-50 dark:bg-blue-900/10">-ω</td>
                      <td className="p-2 bg-blue-50 dark:bg-blue-900/10">-ομεν</td>
                      <td className="p-2 bg-amber-50 dark:bg-amber-900/10">-ον</td>
                      <td className="p-2 bg-amber-50 dark:bg-amber-900/10">-ομεν</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 text-left font-sans">2nd</td>
                      <td className="p-2 bg-blue-50 dark:bg-blue-900/10">-εις</td>
                      <td className="p-2 bg-blue-50 dark:bg-blue-900/10">-ετε</td>
                      <td className="p-2 bg-amber-50 dark:bg-amber-900/10">-ες</td>
                      <td className="p-2 bg-amber-50 dark:bg-amber-900/10">-ετε</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-left font-sans">3rd</td>
                      <td className="p-2 bg-blue-50 dark:bg-blue-900/10">-ει</td>
                      <td className="p-2 bg-blue-50 dark:bg-blue-900/10">-ουσι(ν)</td>
                      <td className="p-2 bg-amber-50 dark:bg-amber-900/10">-ε(ν)</td>
                      <td className="p-2 bg-amber-50 dark:bg-amber-900/10">-ον</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Note: First aorist has its own set of endings (-α, -ας, -ε(ν), -αμεν, -ατε, -αν)
                based on the secondary pattern but with alpha.
              </p>
            </CardContent>
          </Card>

          {/* Study Tips */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Study Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  <span>
                    <strong>Master λύω first</strong> — It's the model verb. Once you know it, you can
                    conjugate thousands of other -ω verbs.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  <span>
                    <strong>Learn εἰμί separately</strong> — It's irregular and extremely common
                    (occurs 2,400+ times in the NT).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  <span>
                    <strong>Look for the augment</strong> — If a verb starts with ἐ- that's not part of the
                    root, it's probably past tense.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">4.</span>
                  <span>
                    <strong>The sigma signals aorist</strong> — ἔλυσα vs ἔλυον: the σ tells you it's
                    aorist, not imperfect.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">5.</span>
                  <span>
                    <strong>Practice with flash cards</strong> — Drill until you can identify person and
                    number instantly from the ending.
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
