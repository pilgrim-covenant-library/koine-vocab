'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ParadigmTable, VerbParadigmTable, ArticleTable } from '@/components/ParadigmTable';
import { cn } from '@/lib/utils';
import paradigmsData from '@/data/paradigms.json';

type TabType = 'nouns' | 'verbs' | 'pronouns' | 'article';

const TABS: { id: TabType; label: string }[] = [
  { id: 'nouns', label: 'Nouns' },
  { id: 'verbs', label: 'Verbs' },
  { id: 'pronouns', label: 'Pronouns' },
  { id: 'article', label: 'Article' },
];

export default function TablesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('nouns');
  const [selectedNoun, setSelectedNoun] = useState<string>('second_masculine');
  const [selectedVerb, setSelectedVerb] = useState<string>('present_active_indicative');
  const [selectedPronoun, setSelectedPronoun] = useState<string>('personal_first');
  const [showEndings, setShowEndings] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nounKeys = Object.keys(paradigmsData.nouns);
  const verbKeys = Object.keys(paradigmsData.verbs);
  const pronounKeys = Object.keys(paradigmsData.pronouns);

  const currentNoun = paradigmsData.nouns[selectedNoun as keyof typeof paradigmsData.nouns];
  const currentVerb = paradigmsData.verbs[selectedVerb as keyof typeof paradigmsData.verbs];
  const currentPronoun = paradigmsData.pronouns[selectedPronoun as keyof typeof paradigmsData.pronouns];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/grammar">
            <Button variant="ghost" size="icon" aria-label="Back to grammar">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Paradigm Tables</h1>
            <p className="text-xs text-muted-foreground">Study Greek forms</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Nouns tab */}
        {activeTab === 'nouns' && (
          <div className="space-y-4">
            {/* Noun selector */}
            <div className="flex flex-wrap gap-2">
              {nounKeys.map((key) => {
                const noun = paradigmsData.nouns[key as keyof typeof paradigmsData.nouns];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedNoun(key)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-colors',
                      selectedNoun === key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {noun.name}
                  </button>
                );
              })}
            </div>

            {/* Options */}
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEndings}
                  onChange={(e) => setShowEndings(e.target.checked)}
                  className="rounded"
                />
                Show endings
              </label>
            </div>

            {/* Noun table */}
            {currentNoun && (
              <ParadigmTable
                title={currentNoun.name}
                subtitle={`${currentNoun.example} (${currentNoun.meaning})`}
                forms={currentNoun.forms}
                endings={showEndings ? currentNoun.endings : undefined}
                rowLabels={['Nominative', 'Genitive', 'Dative', 'Accusative', 'Vocative']}
                columnLabels={['Singular', 'Plural']}
                showEndings={showEndings}
              />
            )}

            {/* Case descriptions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Case Functions
                </h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(paradigmsData.caseDescriptions).map(([caseKey, desc]) => (
                    <div key={caseKey} className="flex gap-2">
                      <span className="font-medium capitalize w-24 shrink-0">{caseKey}:</span>
                      <span className="text-muted-foreground">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Verbs tab */}
        {activeTab === 'verbs' && (
          <div className="space-y-4">
            {/* Verb selector */}
            <div className="flex flex-wrap gap-2">
              {verbKeys.map((key) => {
                const verb = paradigmsData.verbs[key as keyof typeof paradigmsData.verbs];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedVerb(key)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-colors',
                      selectedVerb === key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {verb.name}
                  </button>
                );
              })}
            </div>

            {/* Options */}
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEndings}
                  onChange={(e) => setShowEndings(e.target.checked)}
                  className="rounded"
                />
                Show endings
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTranslations}
                  onChange={(e) => setShowTranslations(e.target.checked)}
                  className="rounded"
                />
                Show translations
              </label>
            </div>

            {/* Verb table */}
            {currentVerb && (
              <VerbParadigmTable
                title={currentVerb.name}
                subtitle={`${currentVerb.example} (${currentVerb.meaning})`}
                forms={currentVerb.forms}
                endings={showEndings ? currentVerb.endings : undefined}
                translations={showTranslations && 'translations' in currentVerb ? currentVerb.translations as { singular: Record<string, string>; plural: Record<string, string> } : undefined}
                showEndings={showEndings}
                showTranslations={showTranslations && 'translations' in currentVerb}
              />
            )}

            {/* Tense descriptions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Tense Meanings
                </h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(paradigmsData.tenseDescriptions).map(([tenseKey, desc]) => (
                    <div key={tenseKey} className="flex gap-2">
                      <span className="font-medium capitalize w-24 shrink-0">{tenseKey}:</span>
                      <span className="text-muted-foreground">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pronouns tab */}
        {activeTab === 'pronouns' && (
          <div className="space-y-4">
            {/* Pronoun selector */}
            <div className="flex flex-wrap gap-2">
              {pronounKeys.map((key) => {
                const pronoun = paradigmsData.pronouns[key as keyof typeof paradigmsData.pronouns];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedPronoun(key)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-colors',
                      selectedPronoun === key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {pronoun.name}
                  </button>
                );
              })}
            </div>

            {/* Pronoun table */}
            {currentPronoun && (
              <PronounTable pronoun={currentPronoun} />
            )}
          </div>
        )}

        {/* Article tab */}
        {activeTab === 'article' && (
          <div className="space-y-4">
            <ArticleTable
              forms={paradigmsData.article.forms as {
                masculine: { singular: Record<string, string>; plural: Record<string, string> };
                feminine: { singular: Record<string, string>; plural: Record<string, string> };
                neuter: { singular: Record<string, string>; plural: Record<string, string> };
              }}
            />

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Article Usage</h3>
                <p className="text-sm text-muted-foreground">
                  The Greek definite article agrees with its noun in gender, number, and case.
                  Unlike English, Greek has no indefinite article &quot;a/an&quot; - the absence
                  of the article can indicate indefiniteness.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

// Pronoun table component
function PronounTable({ pronoun }: { pronoun: { name: string; meaning: string; forms: Record<string, unknown> } }) {
  const forms = pronoun.forms;

  // Check if this is a simple pronoun (1st/2nd person) or has genders (3rd person, demonstratives)
  const hasGenders = 'masculine' in forms;

  if (hasGenders) {
    // Complex pronoun with genders
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-1">{pronoun.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{pronoun.meaning}</p>

          <div className="space-y-4">
            {(['masculine', 'feminine', 'neuter'] as const).map((gender) => {
              const genderForms = forms[gender] as Record<string, Record<string, string>>;
              if (!genderForms) return null;

              return (
                <div key={gender}>
                  <h4 className="text-sm font-medium text-muted-foreground capitalize mb-2">
                    {gender}
                  </h4>
                  <ParadigmTable
                    title=""
                    forms={genderForms}
                    rowLabels={['Nominative', 'Genitive', 'Dative', 'Accusative']}
                    columnLabels={['Singular', 'Plural']}
                    className="border-0 shadow-none"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Simple pronoun without genders
  return (
    <ParadigmTable
      title={pronoun.name}
      subtitle={pronoun.meaning}
      forms={forms as Record<string, Record<string, string>>}
      rowLabels={['Nominative', 'Genitive', 'Dative', 'Accusative']}
      columnLabels={['Singular', 'Plural']}
    />
  );
}
