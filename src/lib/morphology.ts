/**
 * Greek Morphology Utilities
 * For parsing and analyzing Koine Greek word forms
 */

// ============================================
// TYPES
// ============================================

export type GrammaticalCase = 'nominative' | 'genitive' | 'dative' | 'accusative' | 'vocative';
export type GrammaticalNumber = 'singular' | 'plural';
export type GrammaticalGender = 'masculine' | 'feminine' | 'neuter';
export type Tense = 'present' | 'imperfect' | 'future' | 'aorist' | 'perfect' | 'pluperfect';
export type Voice = 'active' | 'middle' | 'passive' | 'middle/passive';
export type Mood = 'indicative' | 'subjunctive' | 'optative' | 'imperative' | 'infinitive' | 'participle';
export type Person = '1st' | '2nd' | '3rd';
export type Declension = '1st' | '2nd' | '3rd';
export type Conjugation = 'omega' | 'mi';

export interface ParsedNoun {
  partOfSpeech: 'noun';
  lexicalForm: string;
  case: GrammaticalCase;
  number: GrammaticalNumber;
  gender: GrammaticalGender;
  declension?: Declension;
}

export interface ParsedVerb {
  partOfSpeech: 'verb';
  lexicalForm: string;
  tense: Tense;
  voice: Voice;
  mood: Mood;
  person?: Person;
  number?: GrammaticalNumber;
  conjugation?: Conjugation;
}

export interface ParsedAdjective {
  partOfSpeech: 'adjective';
  lexicalForm: string;
  case: GrammaticalCase;
  number: GrammaticalNumber;
  gender: GrammaticalGender;
  degree?: 'positive' | 'comparative' | 'superlative';
}

export interface ParsedPronoun {
  partOfSpeech: 'pronoun';
  lexicalForm: string;
  case: GrammaticalCase;
  number: GrammaticalNumber;
  gender?: GrammaticalGender;
  person?: Person;
  type: 'personal' | 'demonstrative' | 'relative' | 'interrogative' | 'indefinite' | 'reflexive';
}

export interface ParsedArticle {
  partOfSpeech: 'article';
  lexicalForm: string;
  case: GrammaticalCase;
  number: GrammaticalNumber;
  gender: GrammaticalGender;
}

export interface ParsedParticiple {
  partOfSpeech: 'participle';
  lexicalForm: string;
  tense: Tense;
  voice: Voice;
  case: GrammaticalCase;
  number: GrammaticalNumber;
  gender: GrammaticalGender;
}

export interface ParsedInfinitive {
  partOfSpeech: 'infinitive';
  lexicalForm: string;
  tense: Tense;
  voice: Voice;
}

export type ParsedMorphology =
  | ParsedNoun
  | ParsedVerb
  | ParsedAdjective
  | ParsedPronoun
  | ParsedArticle
  | ParsedParticiple
  | ParsedInfinitive;

// ============================================
// DISPLAY UTILITIES
// ============================================

export const CASE_LABELS: Record<GrammaticalCase, string> = {
  nominative: 'Nominative',
  genitive: 'Genitive',
  dative: 'Dative',
  accusative: 'Accusative',
  vocative: 'Vocative',
};

export const CASE_ABBREVIATIONS: Record<GrammaticalCase, string> = {
  nominative: 'N',
  genitive: 'G',
  dative: 'D',
  accusative: 'A',
  vocative: 'V',
};

export const NUMBER_LABELS: Record<GrammaticalNumber, string> = {
  singular: 'Singular',
  plural: 'Plural',
};

export const NUMBER_ABBREVIATIONS: Record<GrammaticalNumber, string> = {
  singular: 'S',
  plural: 'P',
};

export const GENDER_LABELS: Record<GrammaticalGender, string> = {
  masculine: 'Masculine',
  feminine: 'Feminine',
  neuter: 'Neuter',
};

export const GENDER_ABBREVIATIONS: Record<GrammaticalGender, string> = {
  masculine: 'M',
  feminine: 'F',
  neuter: 'N',
};

export const TENSE_LABELS: Record<Tense, string> = {
  present: 'Present',
  imperfect: 'Imperfect',
  future: 'Future',
  aorist: 'Aorist',
  perfect: 'Perfect',
  pluperfect: 'Pluperfect',
};

export const VOICE_LABELS: Record<Voice, string> = {
  active: 'Active',
  middle: 'Middle',
  passive: 'Passive',
  'middle/passive': 'Middle/Passive',
};

export const MOOD_LABELS: Record<Mood, string> = {
  indicative: 'Indicative',
  subjunctive: 'Subjunctive',
  optative: 'Optative',
  imperative: 'Imperative',
  infinitive: 'Infinitive',
  participle: 'Participle',
};

export const PERSON_LABELS: Record<Person, string> = {
  '1st': '1st Person',
  '2nd': '2nd Person',
  '3rd': '3rd Person',
};

// ============================================
// PARSING FUNCTIONS
// ============================================

/**
 * Format a parsed morphology object as a human-readable string.
 * Example: "Aorist Active Indicative 3rd Singular" or "Genitive Singular Masculine"
 */
export function formatMorphology(parsed: ParsedMorphology): string {
  switch (parsed.partOfSpeech) {
    case 'verb':
      const verbParts = [
        TENSE_LABELS[parsed.tense],
        VOICE_LABELS[parsed.voice],
        MOOD_LABELS[parsed.mood],
      ];
      if (parsed.person && parsed.number) {
        verbParts.push(PERSON_LABELS[parsed.person]);
        verbParts.push(NUMBER_LABELS[parsed.number]);
      }
      return verbParts.join(' ');

    case 'noun':
    case 'adjective':
    case 'article':
      return [
        CASE_LABELS[parsed.case],
        NUMBER_LABELS[parsed.number],
        GENDER_LABELS[parsed.gender],
      ].join(' ');

    case 'pronoun':
      const pronounParts = [
        CASE_LABELS[parsed.case],
        NUMBER_LABELS[parsed.number],
      ];
      if (parsed.gender) {
        pronounParts.push(GENDER_LABELS[parsed.gender]);
      }
      return pronounParts.join(' ');

    case 'participle':
      return [
        TENSE_LABELS[parsed.tense],
        VOICE_LABELS[parsed.voice],
        'Participle',
        CASE_LABELS[parsed.case],
        NUMBER_LABELS[parsed.number],
        GENDER_LABELS[parsed.gender],
      ].join(' ');

    case 'infinitive':
      return [
        TENSE_LABELS[parsed.tense],
        VOICE_LABELS[parsed.voice],
        'Infinitive',
      ].join(' ');

    default:
      return 'Unknown';
  }
}

/**
 * Format a parsed morphology object as a compact abbreviation.
 * Example: "AAI3S" (Aorist Active Indicative 3rd Singular)
 */
export function formatMorphologyAbbrev(parsed: ParsedMorphology): string {
  switch (parsed.partOfSpeech) {
    case 'verb':
      const tenseAbbr = parsed.tense[0].toUpperCase();
      const voiceAbbr = parsed.voice === 'middle/passive' ? 'M/P' : parsed.voice[0].toUpperCase();
      const moodAbbr = parsed.mood[0].toUpperCase();
      const personAbbr = parsed.person ? parsed.person[0] : '';
      const numAbbr = parsed.number ? NUMBER_ABBREVIATIONS[parsed.number] : '';
      return `${tenseAbbr}${voiceAbbr}${moodAbbr}${personAbbr}${numAbbr}`;

    case 'noun':
    case 'adjective':
    case 'article':
      return `${CASE_ABBREVIATIONS[parsed.case]}${NUMBER_ABBREVIATIONS[parsed.number]}${GENDER_ABBREVIATIONS[parsed.gender]}`;

    case 'pronoun':
      return `${CASE_ABBREVIATIONS[parsed.case]}${NUMBER_ABBREVIATIONS[parsed.number]}${parsed.gender ? GENDER_ABBREVIATIONS[parsed.gender] : ''}`;

    case 'participle':
      const ptTenseAbbr = parsed.tense[0].toUpperCase();
      const ptVoiceAbbr = parsed.voice === 'middle/passive' ? 'M/P' : parsed.voice[0].toUpperCase();
      return `${ptTenseAbbr}${ptVoiceAbbr}P-${CASE_ABBREVIATIONS[parsed.case]}${NUMBER_ABBREVIATIONS[parsed.number]}${GENDER_ABBREVIATIONS[parsed.gender]}`;

    case 'infinitive':
      const infTenseAbbr = parsed.tense[0].toUpperCase();
      const infVoiceAbbr = parsed.voice === 'middle/passive' ? 'M/P' : parsed.voice[0].toUpperCase();
      return `${infTenseAbbr}${infVoiceAbbr}N`;

    default:
      return '?';
  }
}

/**
 * Get a description of what a grammatical case means/indicates.
 */
export function getCaseDescription(grammaticalCase: GrammaticalCase): string {
  const descriptions: Record<GrammaticalCase, string> = {
    nominative: 'Subject of the sentence; identifies who or what performs the action',
    genitive: 'Possession, source, or relationship; often translated with "of"',
    dative: 'Indirect object; indicates to/for whom something is done',
    accusative: 'Direct object; receives the action of the verb',
    vocative: 'Direct address; used when calling or speaking to someone',
  };
  return descriptions[grammaticalCase];
}

/**
 * Get a description of what a verbal tense indicates in Greek.
 */
export function getTenseDescription(tense: Tense): string {
  const descriptions: Record<Tense, string> = {
    present: 'Ongoing or repeated action; often "continuous" aspect',
    imperfect: 'Past ongoing action; "was doing" or "used to do"',
    future: 'Action yet to happen; "will do"',
    aorist: 'Simple/undefined action; often past tense, focuses on occurrence not duration',
    perfect: 'Completed action with present results; "have done"',
    pluperfect: 'Past completed action with past results; "had done"',
  };
  return descriptions[tense];
}

/**
 * Get a description of what a verbal mood indicates.
 */
export function getMoodDescription(mood: Mood): string {
  const descriptions: Record<Mood, string> = {
    indicative: 'Factual statement or question; asserts reality',
    subjunctive: 'Possibility, purpose, exhortation; often in subordinate clauses',
    optative: 'Wish or potential; less common in NT Greek',
    imperative: 'Command or request; direct instruction',
    infinitive: 'Verbal noun; "to do" - can function as subject or object',
    participle: 'Verbal adjective; combines action with description',
  };
  return descriptions[mood];
}

/**
 * Get a description of what a verbal voice indicates.
 */
export function getVoiceDescription(voice: Voice): string {
  const descriptions: Record<Voice, string> = {
    active: 'Subject performs the action',
    middle: 'Subject acts upon itself or for its own benefit',
    passive: 'Subject receives the action',
    'middle/passive': 'Form can be either middle or passive (determined by context)',
  };
  return descriptions[voice];
}

// ============================================
// PRACTICE QUESTION GENERATORS
// ============================================

export interface MorphologyQuestion {
  word: string;
  lexicalForm: string;
  gloss: string;
  correctAnswer: string;
  options: string[];
  questionType: 'case' | 'number' | 'gender' | 'tense' | 'voice' | 'mood' | 'person' | 'full';
  hint?: string;
}

const ALL_CASES: GrammaticalCase[] = ['nominative', 'genitive', 'dative', 'accusative', 'vocative'];
const ALL_NUMBERS: GrammaticalNumber[] = ['singular', 'plural'];
const ALL_GENDERS: GrammaticalGender[] = ['masculine', 'feminine', 'neuter'];
const ALL_TENSES: Tense[] = ['present', 'imperfect', 'future', 'aorist', 'perfect', 'pluperfect'];
const ALL_VOICES: Voice[] = ['active', 'middle', 'passive'];
const ALL_MOODS: Mood[] = ['indicative', 'subjunctive', 'optative', 'imperative'];
const ALL_PERSONS: Person[] = ['1st', '2nd', '3rd'];

/**
 * Generate options for a morphology question, ensuring the correct answer is included.
 */
export function generateOptions<T extends string>(
  correctAnswer: T,
  allOptions: T[],
  count: number = 4
): T[] {
  const options = new Set<T>([correctAnswer]);
  const shuffled = [...allOptions].sort(() => Math.random() - 0.5);

  for (const option of shuffled) {
    if (options.size >= count) break;
    options.add(option);
  }

  return [...options].sort(() => Math.random() - 0.5);
}

/**
 * Generate a case identification question.
 */
export function generateCaseQuestion(
  word: string,
  lexicalForm: string,
  gloss: string,
  correctCase: GrammaticalCase
): MorphologyQuestion {
  return {
    word,
    lexicalForm,
    gloss,
    correctAnswer: CASE_LABELS[correctCase],
    options: generateOptions(correctCase, ALL_CASES).map(c => CASE_LABELS[c]),
    questionType: 'case',
    hint: getCaseDescription(correctCase),
  };
}

/**
 * Generate a tense identification question.
 */
export function generateTenseQuestion(
  word: string,
  lexicalForm: string,
  gloss: string,
  correctTense: Tense
): MorphologyQuestion {
  return {
    word,
    lexicalForm,
    gloss,
    correctAnswer: TENSE_LABELS[correctTense],
    options: generateOptions(correctTense, ALL_TENSES).map(t => TENSE_LABELS[t]),
    questionType: 'tense',
    hint: getTenseDescription(correctTense),
  };
}

/**
 * Generate a voice identification question.
 */
export function generateVoiceQuestion(
  word: string,
  lexicalForm: string,
  gloss: string,
  correctVoice: Voice
): MorphologyQuestion {
  const voiceOptions: Voice[] = ['active', 'middle', 'passive'];
  return {
    word,
    lexicalForm,
    gloss,
    correctAnswer: VOICE_LABELS[correctVoice],
    options: generateOptions(correctVoice, voiceOptions).map(v => VOICE_LABELS[v]),
    questionType: 'voice',
    hint: getVoiceDescription(correctVoice),
  };
}

/**
 * Generate a mood identification question.
 */
export function generateMoodQuestion(
  word: string,
  lexicalForm: string,
  gloss: string,
  correctMood: Mood
): MorphologyQuestion {
  return {
    word,
    lexicalForm,
    gloss,
    correctAnswer: MOOD_LABELS[correctMood],
    options: generateOptions(correctMood, ALL_MOODS).map(m => MOOD_LABELS[m]),
    questionType: 'mood',
    hint: getMoodDescription(correctMood),
  };
}
