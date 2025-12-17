'use client';

import { cn } from '@/lib/utils';
import type { VocabularyWord, WordMorphology } from '@/types';

interface MorphologyDisplayProps {
  word: VocabularyWord;
  className?: string;
  compact?: boolean;
}

// Part of speech abbreviations and labels
const POS_LABELS: Record<string, { abbr: string; label: string; color: string }> = {
  noun: { abbr: 'n.', label: 'Noun', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  verb: { abbr: 'v.', label: 'Verb', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  adjective: { abbr: 'adj.', label: 'Adjective', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  adverb: { abbr: 'adv.', label: 'Adverb', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  preposition: { abbr: 'prep.', label: 'Preposition', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  conjunction: { abbr: 'conj.', label: 'Conjunction', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
  particle: { abbr: 'part.', label: 'Particle', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  pronoun: { abbr: 'pron.', label: 'Pronoun', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' },
  article: { abbr: 'art.', label: 'Article', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  interjection: { abbr: 'interj.', label: 'Interjection', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

// Gender abbreviations
const GENDER_LABELS: Record<string, { abbr: string; label: string }> = {
  masculine: { abbr: 'm.', label: 'Masculine' },
  feminine: { abbr: 'f.', label: 'Feminine' },
  neuter: { abbr: 'n.', label: 'Neuter' },
};

// Declension labels
const DECLENSION_LABELS: Record<string, string> = {
  '1st': '1st Declension',
  '2nd': '2nd Declension',
  '3rd': '3rd Declension',
};

// Derive morphology from word patterns when not explicitly provided
function deriveMorphology(word: VocabularyWord): Partial<WordMorphology> {
  const greek = word.greek;
  const pos = word.partOfSpeech;
  const derived: Partial<WordMorphology> = {};

  if (pos === 'noun') {
    // Derive gender/declension from ending patterns
    // 2nd declension masculine: -ος
    if (greek.endsWith('ος') || greek.endsWith('ός')) {
      derived.gender = 'masculine';
      derived.declension = '2nd';
    }
    // 2nd declension neuter: -ον
    else if (greek.endsWith('ον') || greek.endsWith('όν')) {
      derived.gender = 'neuter';
      derived.declension = '2nd';
    }
    // 1st declension feminine: -α, -η
    else if (greek.endsWith('α') || greek.endsWith('ά') || greek.endsWith('η') || greek.endsWith('ή')) {
      derived.gender = 'feminine';
      derived.declension = '1st';
    }
    // 1st declension masculine: -ας, -ης
    else if (greek.endsWith('ας') || greek.endsWith('άς') || greek.endsWith('ης') || greek.endsWith('ής')) {
      derived.gender = 'masculine';
      derived.declension = '1st';
    }
    // 3rd declension patterns are more complex
    else if (
      greek.endsWith('ις') || greek.endsWith('ίς') ||
      greek.endsWith('υς') || greek.endsWith('ύς') ||
      greek.endsWith('ευς') || greek.endsWith('εύς') ||
      greek.endsWith('ων') || greek.endsWith('ών') ||
      greek.endsWith('ηρ') || greek.endsWith('ήρ') ||
      greek.endsWith('μα') || greek.endsWith('μά')
    ) {
      derived.declension = '3rd';
      // -μα words are typically neuter
      if (greek.endsWith('μα') || greek.endsWith('μά')) {
        derived.gender = 'neuter';
      }
    }
  }

  if (pos === 'verb') {
    // Check for common verb patterns
    // -ω verbs (thematic/omega verbs)
    if (greek.endsWith('ω') || greek.endsWith('ώ')) {
      derived.conjugation = '1st';
    }
    // -μι verbs (athematic)
    else if (greek.endsWith('μι') || greek.endsWith('μί')) {
      derived.conjugation = '2nd';
    }
    // Check for deponent indicators (middle/passive in form but active in meaning)
    if (greek.endsWith('ομαι') || greek.endsWith('όμαι')) {
      derived.deponent = true;
    }
  }

  if (pos === 'adjective') {
    // 2-1-2 pattern (most common): -ος, -η/-α, -ον
    if (greek.includes(',') && greek.includes('ος')) {
      derived.pattern = '2-1-2';
    }
    // 3-3 pattern (two-termination): -ης, -ες or similar
    else if (greek.endsWith('ης') || greek.endsWith('ές')) {
      derived.pattern = '3-3';
    }
  }

  if (pos === 'pronoun') {
    // Derive person from common pronouns
    if (greek === 'ἐγώ' || word.gloss.toLowerCase().includes('i ')) {
      derived.person = 1;
    } else if (greek === 'σύ' || word.gloss.toLowerCase().includes('you')) {
      derived.person = 2;
    } else if (greek === 'αὐτός' || word.gloss.toLowerCase().startsWith('he') || word.gloss.toLowerCase().startsWith('she')) {
      derived.person = 3;
    }
  }

  return derived;
}

export function MorphologyDisplay({ word, className, compact = false }: MorphologyDisplayProps) {
  const posInfo = POS_LABELS[word.partOfSpeech] || {
    abbr: word.partOfSpeech,
    label: word.partOfSpeech,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  // Merge explicit morphology with derived morphology
  const derivedMorph = deriveMorphology(word);
  const morph = { ...derivedMorph, ...word.morphology };

  // Build morphology tags
  const tags: { label: string; title: string }[] = [];

  // Part of speech is always shown
  tags.push({ label: posInfo.abbr, title: posInfo.label });

  // Gender (for nouns, adjectives, pronouns)
  if (morph.gender) {
    const genderInfo = GENDER_LABELS[morph.gender];
    tags.push({ label: genderInfo.abbr, title: genderInfo.label });
  }

  // Declension (for nouns)
  if (morph.declension) {
    tags.push({ label: morph.declension, title: DECLENSION_LABELS[morph.declension] });
  }

  // Conjugation (for verbs)
  if (morph.conjugation) {
    if (morph.conjugation === 'irregular') {
      tags.push({ label: 'irreg.', title: 'Irregular Conjugation' });
    } else {
      tags.push({ label: `-ω`, title: `${morph.conjugation} Conjugation (Thematic)` });
    }
  }

  // Deponent (for verbs)
  if (morph.deponent) {
    tags.push({ label: 'dep.', title: 'Deponent (middle/passive form, active meaning)' });
  }

  // Person (for pronouns)
  if (morph.person) {
    tags.push({ label: `${morph.person}p`, title: `${morph.person}${morph.person === 1 ? 'st' : morph.person === 2 ? 'nd' : 'rd'} Person` });
  }

  // Pattern (for adjectives)
  if (morph.pattern) {
    tags.push({ label: morph.pattern, title: `${morph.pattern} Adjective Pattern` });
  }

  if (compact) {
    // Compact mode: single line of tags
    return (
      <div className={cn('flex flex-wrap gap-1', className)}>
        {tags.map((tag, i) => (
          <span
            key={i}
            title={tag.title}
            className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-medium cursor-help',
              i === 0 ? posInfo.color : 'bg-muted text-muted-foreground'
            )}
          >
            {tag.label}
          </span>
        ))}
      </div>
    );
  }

  // Full mode: more detailed display
  return (
    <div className={cn('space-y-2', className)}>
      {/* Part of Speech Badge */}
      <div className="flex items-center gap-2">
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', posInfo.color)}>
          {posInfo.label}
        </span>
        {morph.deponent && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            Deponent
          </span>
        )}
      </div>

      {/* Morphology Details */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {morph.gender && (
          <span>
            <span className="font-medium">Gender:</span> {GENDER_LABELS[morph.gender].label}
          </span>
        )}
        {morph.declension && (
          <span>
            <span className="font-medium">Declension:</span> {morph.declension}
          </span>
        )}
        {morph.conjugation && (
          <span>
            <span className="font-medium">Conjugation:</span>{' '}
            {morph.conjugation === 'irregular' ? 'Irregular' : `${morph.conjugation} (-ω)`}
          </span>
        )}
        {morph.person && (
          <span>
            <span className="font-medium">Person:</span>{' '}
            {morph.person === 1 ? '1st' : morph.person === 2 ? '2nd' : '3rd'}
          </span>
        )}
        {morph.pattern && (
          <span>
            <span className="font-medium">Pattern:</span> {morph.pattern}
          </span>
        )}
      </div>

      {/* Principal Parts (for verbs) */}
      {morph.principalParts && morph.principalParts.length > 0 && (
        <div className="text-xs">
          <span className="font-medium text-muted-foreground">Principal Parts:</span>
          <div className="mt-1 font-greek text-sm">
            {morph.principalParts.join(', ')}
          </div>
        </div>
      )}

      {/* Strong's Reference */}
      <div className="text-xs text-muted-foreground">
        <span className="font-medium">Strong&apos;s:</span>{' '}
        <a
          href={`https://biblehub.com/greek/${word.strongs.replace('G', '')}.htm`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {word.strongs}
        </a>
      </div>
    </div>
  );
}

// Simplified badge for inline use
export function PartOfSpeechBadge({
  partOfSpeech,
  className,
}: {
  partOfSpeech: string;
  className?: string;
}) {
  const posInfo = POS_LABELS[partOfSpeech] || {
    abbr: partOfSpeech,
    label: partOfSpeech,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', posInfo.color, className)}>
      {posInfo.abbr}
    </span>
  );
}
