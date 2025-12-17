'use client';

import { cn } from '@/lib/utils';
import { GreekWord } from './GreekWord';
import {
  ParsedMorphology,
  formatMorphology,
  formatMorphologyAbbrev,
  getCaseDescription,
  getTenseDescription,
  getMoodDescription,
  getVoiceDescription,
  CASE_LABELS,
  NUMBER_LABELS,
  GENDER_LABELS,
  TENSE_LABELS,
  VOICE_LABELS,
  MOOD_LABELS,
  PERSON_LABELS,
} from '@/lib/morphology';
import { Info, BookOpen, ArrowRight } from 'lucide-react';

interface MorphologyBreakdownProps {
  word: string;
  parsing: ParsedMorphology;
  showDescription?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Display a detailed morphological breakdown of a Greek word.
 */
export function MorphologyBreakdown({
  word,
  parsing,
  showDescription = true,
  compact = false,
  className,
}: MorphologyBreakdownProps) {
  const fullParsing = formatMorphology(parsing);
  const abbrev = formatMorphologyAbbrev(parsing);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <GreekWord greek={word} size="md" />
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{fullParsing}</span>
        <span className="text-xs text-muted-foreground">({abbrev})</span>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border bg-card overflow-hidden', className)}>
      {/* Header with word */}
      <div className="px-4 py-4 border-b bg-muted/50 text-center">
        <GreekWord greek={word} size="xl" />
        <p className="text-sm text-muted-foreground mt-1">
          from <GreekWord greek={parsing.lexicalForm} size="sm" className="inline" />
        </p>
      </div>

      {/* Parsing summary */}
      <div className="px-4 py-3 border-b bg-primary/5">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">{fullParsing}</span>
          <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
            {abbrev}
          </span>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="divide-y">
        {parsing.partOfSpeech === 'verb' && (
          <>
            <MorphologyRow
              label="Tense"
              value={TENSE_LABELS[parsing.tense]}
              description={showDescription ? getTenseDescription(parsing.tense) : undefined}
            />
            <MorphologyRow
              label="Voice"
              value={VOICE_LABELS[parsing.voice]}
              description={showDescription ? getVoiceDescription(parsing.voice) : undefined}
            />
            <MorphologyRow
              label="Mood"
              value={MOOD_LABELS[parsing.mood]}
              description={showDescription ? getMoodDescription(parsing.mood) : undefined}
            />
            {parsing.person && (
              <MorphologyRow label="Person" value={PERSON_LABELS[parsing.person]} />
            )}
            {parsing.number && (
              <MorphologyRow label="Number" value={NUMBER_LABELS[parsing.number]} />
            )}
          </>
        )}

        {(parsing.partOfSpeech === 'noun' ||
          parsing.partOfSpeech === 'adjective' ||
          parsing.partOfSpeech === 'article') && (
          <>
            <MorphologyRow
              label="Case"
              value={CASE_LABELS[parsing.case]}
              description={showDescription ? getCaseDescription(parsing.case) : undefined}
            />
            <MorphologyRow label="Number" value={NUMBER_LABELS[parsing.number]} />
            <MorphologyRow label="Gender" value={GENDER_LABELS[parsing.gender]} />
          </>
        )}

        {parsing.partOfSpeech === 'pronoun' && (
          <>
            <MorphologyRow
              label="Case"
              value={CASE_LABELS[parsing.case]}
              description={showDescription ? getCaseDescription(parsing.case) : undefined}
            />
            <MorphologyRow label="Number" value={NUMBER_LABELS[parsing.number]} />
            {parsing.gender && (
              <MorphologyRow label="Gender" value={GENDER_LABELS[parsing.gender]} />
            )}
            {parsing.person && (
              <MorphologyRow label="Person" value={PERSON_LABELS[parsing.person]} />
            )}
            <MorphologyRow
              label="Type"
              value={parsing.type.charAt(0).toUpperCase() + parsing.type.slice(1)}
            />
          </>
        )}

        {parsing.partOfSpeech === 'participle' && (
          <>
            <MorphologyRow
              label="Tense"
              value={TENSE_LABELS[parsing.tense]}
              description={showDescription ? getTenseDescription(parsing.tense) : undefined}
            />
            <MorphologyRow
              label="Voice"
              value={VOICE_LABELS[parsing.voice]}
              description={showDescription ? getVoiceDescription(parsing.voice) : undefined}
            />
            <MorphologyRow
              label="Case"
              value={CASE_LABELS[parsing.case]}
              description={showDescription ? getCaseDescription(parsing.case) : undefined}
            />
            <MorphologyRow label="Number" value={NUMBER_LABELS[parsing.number]} />
            <MorphologyRow label="Gender" value={GENDER_LABELS[parsing.gender]} />
          </>
        )}

        {parsing.partOfSpeech === 'infinitive' && (
          <>
            <MorphologyRow
              label="Tense"
              value={TENSE_LABELS[parsing.tense]}
              description={showDescription ? getTenseDescription(parsing.tense) : undefined}
            />
            <MorphologyRow
              label="Voice"
              value={VOICE_LABELS[parsing.voice]}
              description={showDescription ? getVoiceDescription(parsing.voice) : undefined}
            />
          </>
        )}
      </div>
    </div>
  );
}

interface MorphologyRowProps {
  label: string;
  value: string;
  description?: string;
}

function MorphologyRow({ label, value, description }: MorphologyRowProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 shrink-0" />
          {description}
        </p>
      )}
    </div>
  );
}

interface MorphologyBadgeProps {
  parsing: ParsedMorphology;
  className?: string;
}

/**
 * A compact badge showing the abbreviated parsing.
 */
export function MorphologyBadge({ parsing, className }: MorphologyBadgeProps) {
  const abbrev = formatMorphologyAbbrev(parsing);
  const full = formatMorphology(parsing);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-muted',
        className
      )}
      title={full}
    >
      {abbrev}
    </span>
  );
}

interface ParsedWordDisplayProps {
  word: string;
  lexicalForm: string;
  gloss: string;
  parsing: string;
  className?: string;
}

/**
 * Display a parsed word with its lexical form and gloss.
 */
export function ParsedWordDisplay({
  word,
  lexicalForm,
  gloss,
  parsing,
  className,
}: ParsedWordDisplayProps) {
  return (
    <div className={cn('flex flex-col items-center text-center p-4', className)}>
      <GreekWord greek={word} size="xl" />
      <div className="mt-2 space-y-1">
        <p className="text-sm">
          <span className="text-muted-foreground">from </span>
          <GreekWord greek={lexicalForm} size="sm" className="inline font-semibold" />
          <span className="text-muted-foreground"> ({gloss})</span>
        </p>
        <p className="text-sm font-medium text-primary">{parsing}</p>
      </div>
    </div>
  );
}

interface GrammarExplanationProps {
  title: string;
  explanation: string;
  examples?: { greek: string; translation: string }[];
  className?: string;
}

/**
 * Display a grammar concept explanation with examples.
 */
export function GrammarExplanation({
  title,
  explanation,
  examples,
  className,
}: GrammarExplanationProps) {
  return (
    <div className={cn('rounded-xl border bg-card overflow-hidden', className)}>
      <div className="px-4 py-3 border-b bg-muted/50 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-3">{explanation}</p>
        {examples && examples.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Examples
            </p>
            {examples.map((ex, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <GreekWord greek={ex.greek} size="sm" />
                <span className="text-muted-foreground">—</span>
                <span>{ex.translation}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
