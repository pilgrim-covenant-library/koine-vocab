// Homework Type Definitions

import type { ParsedMorphology } from '@/lib/morphology';

// Word-level annotation for clickable Greek text (used in Section 6 translation)
export interface VerseWord {
  surface: string;           // Word as displayed (with punctuation)
  lemma: string;             // Dictionary form
  strongs?: string;          // Strong's G-number (e.g., "G746")
  gloss: string;             // English meaning
  parsing: ParsedMorphology; // Full grammatical info
}

// HW1 Section IDs (5 sections)
export type SectionId = 1 | 2 | 3 | 4 | 5;

// HW2 Section IDs (5 sections)
export type HW2SectionId = 1 | 2 | 3 | 4 | 5;

export type QuestionType = 'transliteration' | 'verse' | 'mcq' | 'translation';

// Base question interface
export interface BaseQuestion {
  id: string;
  type: QuestionType;
}

// For Section 1: Word transliteration (Greek → type Latin)
export interface TransliterationQuestion extends BaseQuestion {
  type: 'transliteration';
  greek: string;
  answer: string;
  variants: string[];  // Acceptable alternative spellings
  gloss?: string;      // English meaning for feedback
}

// For Section 2: Verse transliteration
export interface VerseQuestion extends BaseQuestion {
  type: 'verse';
  reference: string;   // e.g., "John 1:1"
  greek: string;
  answer: string;
  variants: string[];
}

// For Sections 3-5: Multiple choice
export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  question: string;
  greek?: string;      // Optional Greek text to display
  vocabHelp?: string;  // Vocabulary glosses for unfamiliar words
  options: string[];
  correctIndex: number;
  explanation: string;
  category?: string;   // e.g., "noun", "nominative", "masculine"
}

// For Section 6 (HW4): Verse translation (Greek → freeform English)
export interface TranslationQuestion extends BaseQuestion {
  type: 'translation';
  reference: string;      // e.g., "Mark 1:1"
  greek: string;
  transliteration: string;
  referenceTranslation: string;
  keyTerms: string[];
  difficulty: 1 | 2 | 3;
  notes?: string;         // Grammar/context hints
  vocabHelp?: string;     // Vocabulary glosses for unfamiliar words
  words?: VerseWord[];    // Per-word annotations for clickable Greek text
}

// Union type for all questions
export type HomeworkQuestion = TransliterationQuestion | VerseQuestion | MCQQuestion | TranslationQuestion;

// Answer tracking
export interface QuestionAnswer {
  questionId: string;
  userAnswer: string | number;
  isCorrect: boolean;
  timestamp: number;
}

// Section progress
export interface SectionProgress {
  sectionId: SectionId;
  status: 'not_started' | 'in_progress' | 'completed';
  currentIndex: number;
  answers: QuestionAnswer[];
  score: number;
  totalQuestions: number;
  startedAt?: number;
  completedAt?: number;
}

// Overall homework progress
export interface Homework1Progress {
  id: 'hw1';
  status: 'not_started' | 'in_progress' | 'completed';
  sections: Record<SectionId, SectionProgress>;
  currentSection: SectionId;
  startedAt?: number;
  completedAt?: number;
  totalScore: number;
  totalPossible: number;
}

// Section metadata for display
export interface SectionMeta {
  id: SectionId;
  title: string;
  description: string;
  questionCount: number;
  helpPage: string;
}

// Help page content types
export interface AlphabetEntry {
  greek: string;
  latin: string;
  name: string;
  example?: string;
}

export interface GrammarTerm {
  term: string;
  definition: string;
  example: string;
  greekExample?: string;
}

export interface CaseDefinition {
  name: string;
  function: string;
  question: string;  // e.g., "Who/What?"
  example: string;
  greekExample: string;
}

// Helper type for creating initial state
export const createInitialSectionProgress = (
  sectionId: SectionId,
  totalQuestions: number
): SectionProgress => ({
  sectionId,
  status: 'not_started',
  currentIndex: 0,
  answers: [],
  score: 0,
  totalQuestions,
});

export const createInitialHomework1Progress = (): Homework1Progress => ({
  id: 'hw1',
  status: 'not_started',
  sections: {
    1: createInitialSectionProgress(1, 25),  // 25 individual Greek letters
    2: createInitialSectionProgress(2, 16),  // 16 Greek words (full alphabet coverage)
    3: createInitialSectionProgress(3, 10),  // 10 grammar term MCQs
    4: createInitialSectionProgress(4, 5),   // 5 case MCQs
    5: createInitialSectionProgress(5, 24),  // 24 article parsing MCQs
  },
  currentSection: 1,
  totalScore: 0,
  totalPossible: 80,
});

// Section metadata for HW1
export const SECTION_META: Record<SectionId, SectionMeta> = {
  1: {
    id: 1,
    title: 'Greek Alphabet',
    description: 'Transliterate each letter of the Greek alphabet',
    questionCount: 25,
    helpPage: '/homework/help/transliteration',
  },
  2: {
    id: 2,
    title: 'Word Transliteration',
    description: 'Transliterate Greek words to reinforce all 24 letters',
    questionCount: 16,
    helpPage: '/homework/help/transliteration',
  },
  3: {
    id: 3,
    title: 'Grammar Terms',
    description: 'Test your knowledge of English grammar terminology',
    questionCount: 10,
    helpPage: '/homework/help/grammar-terms',
  },
  4: {
    id: 4,
    title: 'Greek Cases',
    description: 'Learn the five cases used in Koine Greek',
    questionCount: 5,
    helpPage: '/homework/help/greek-cases',
  },
  5: {
    id: 5,
    title: 'Article Paradigm',
    description: 'Parse all forms of the Greek definite article (ὁ, ἡ, τό)',
    questionCount: 24,
    helpPage: '/homework/help/article-paradigm',
  },
};

// =============================================================================
// HOMEWORK 2 TYPES
// =============================================================================

// HW2 Section progress (reuses SectionProgress interface with HW2SectionId)
export interface HW2SectionProgress {
  sectionId: HW2SectionId;
  status: 'not_started' | 'in_progress' | 'completed';
  currentIndex: number;
  answers: QuestionAnswer[];
  score: number;
  totalQuestions: number;
  startedAt?: number;
  completedAt?: number;
}

// Overall homework 2 progress
export interface Homework2Progress {
  id: 'hw2';
  status: 'not_started' | 'in_progress' | 'completed';
  sections: Record<HW2SectionId, HW2SectionProgress>;
  currentSection: HW2SectionId;
  startedAt?: number;
  completedAt?: number;
  totalScore: number;
  totalPossible: number;
}

// HW2 Section metadata
export interface HW2SectionMeta {
  id: HW2SectionId;
  title: string;
  description: string;
  questionCount: number;
  helpPage: string;
}

// Helper type for creating initial HW2 section state
export const createInitialHW2SectionProgress = (
  sectionId: HW2SectionId,
  totalQuestions: number
): HW2SectionProgress => ({
  sectionId,
  status: 'not_started',
  currentIndex: 0,
  answers: [],
  score: 0,
  totalQuestions,
});

export const createInitialHomework2Progress = (): Homework2Progress => ({
  id: 'hw2',
  status: 'not_started',
  sections: {
    1: createInitialHW2SectionProgress(1, 24),  // 24 masculine noun questions (2nd decl: λόγος, ἄνθρωπος, θεός)
    2: createInitialHW2SectionProgress(2, 24),  // 24 feminine noun questions
    3: createInitialHW2SectionProgress(3, 24),  // 24 neuter noun questions (2nd decl: ἔργον, τέκνον, εὐαγγέλιον)
    4: createInitialHW2SectionProgress(4, 24),  // 24 personal pronoun questions
    5: createInitialHW2SectionProgress(5, 40),  // 40 preposition questions
  },
  currentSection: 1,
  totalScore: 0,
  totalPossible: 156,
});

// Section metadata for HW2
export const HW2_SECTION_META: Record<HW2SectionId, HW2SectionMeta> = {
  1: {
    id: 1,
    title: 'Masculine Nouns',
    description: 'Parse 2nd declension masculine noun forms (λόγος, ἄνθρωπος, θεός)',
    questionCount: 24,
    helpPage: '/homework/help/noun-paradigms',
  },
  2: {
    id: 2,
    title: 'Feminine Nouns',
    description: 'Parse eta, alpha-pure, and alpha-impure feminine noun forms',
    questionCount: 24,
    helpPage: '/homework/help/noun-paradigms',
  },
  3: {
    id: 3,
    title: 'Neuter Nouns',
    description: 'Parse 2nd declension neuter noun forms (ἔργον, τέκνον, εὐαγγέλιον)',
    questionCount: 24,
    helpPage: '/homework/help/noun-paradigms',
  },
  4: {
    id: 4,
    title: 'Personal Pronouns',
    description: 'Parse 1st, 2nd, and 3rd person pronoun forms',
    questionCount: 24,
    helpPage: '/homework/help/pronouns',
  },
  5: {
    id: 5,
    title: 'Prepositions',
    description: 'Learn 16 Greek prepositions: meanings, usage, and distinctions',
    questionCount: 40,
    helpPage: '/homework/help/prepositions',
  },
};
// =============================================================================
// HOMEWORK 3 TYPES
// =============================================================================

// HW3 Section IDs (5 sections)
export type HW3SectionId = 1 | 2 | 3 | 4 | 5;

// HW3 Section progress
export interface HW3SectionProgress {
  sectionId: HW3SectionId;
  status: 'not_started' | 'in_progress' | 'completed';
  currentIndex: number;
  answers: QuestionAnswer[];
  score: number;
  totalQuestions: number;
  startedAt?: number;
  completedAt?: number;
}

// Overall homework 3 progress
export interface Homework3Progress {
  id: 'hw3';
  status: 'not_started' | 'in_progress' | 'completed';
  sections: Record<HW3SectionId, HW3SectionProgress>;
  currentSection: HW3SectionId;
  startedAt?: number;
  completedAt?: number;
  totalScore: number;
  totalPossible: number;
}

// HW3 Section metadata
export interface HW3SectionMeta {
  id: HW3SectionId;
  title: string;
  description: string;
  questionCount: number;
  helpPage: string;
}

// Helper type for creating initial HW3 section state
export const createInitialHW3SectionProgress = (
  sectionId: HW3SectionId,
  totalQuestions: number
): HW3SectionProgress => ({
  sectionId,
  status: 'not_started',
  currentIndex: 0,
  answers: [],
  score: 0,
  totalQuestions,
});

export const createInitialHomework3Progress = (): Homework3Progress => ({
  id: 'hw3',
  status: 'not_started',
  sections: {
    1: createInitialHW3SectionProgress(1, 10),  // Present Active Indicative of λύω
    2: createInitialHW3SectionProgress(2, 10),  // Imperfect Active Indicative of λύω
    3: createInitialHW3SectionProgress(3, 10),  // Present Active Indicative of εἰμί
    4: createInitialHW3SectionProgress(4, 10),  // Imperfect Active Indicative of εἰμί
    5: createInitialHW3SectionProgress(5, 10),  // First Aorist Active Indicative of λύω
  },
  currentSection: 1,
  totalScore: 0,
  totalPossible: 50,
});

// Section metadata for HW3
export const HW3_SECTION_META: Record<HW3SectionId, HW3SectionMeta> = {
  1: {
    id: 1,
    title: 'Present Active Indicative (λύω)',
    description: 'Parse present active indicative verb forms of λύω',
    questionCount: 10,
    helpPage: '/homework/help/verb-paradigms',
  },
  2: {
    id: 2,
    title: 'Imperfect Active Indicative (λύω)',
    description: 'Parse imperfect active indicative verb forms of λύω',
    questionCount: 10,
    helpPage: '/homework/help/verb-paradigms',
  },
  3: {
    id: 3,
    title: 'Present Active Indicative (εἰμί)',
    description: 'Parse present active indicative verb forms of εἰμί',
    questionCount: 10,
    helpPage: '/homework/help/verb-paradigms',
  },
  4: {
    id: 4,
    title: 'Imperfect Active Indicative (εἰμί)',
    description: 'Parse imperfect active indicative verb forms of εἰμί',
    questionCount: 10,
    helpPage: '/homework/help/verb-paradigms',
  },
  5: {
    id: 5,
    title: 'First Aorist Active Indicative (λύω)',
    description: 'Parse first aorist active indicative verb forms of λύω',
    questionCount: 10,
    helpPage: '/homework/help/verb-paradigms',
  },
};

// =============================================================================
// HOMEWORK 4 TYPES
// =============================================================================

// HW4 Section IDs (6 sections)
export type HW4SectionId = 1 | 2 | 3 | 4 | 5 | 6;

// HW4 Section progress
export interface HW4SectionProgress {
  sectionId: HW4SectionId;
  status: 'not_started' | 'in_progress' | 'completed';
  currentIndex: number;
  answers: QuestionAnswer[];
  score: number;
  totalQuestions: number;
  startedAt?: number;
  completedAt?: number;
}

// Overall homework 4 progress
export interface Homework4Progress {
  id: 'hw4';
  status: 'not_started' | 'in_progress' | 'completed';
  sections: Record<HW4SectionId, HW4SectionProgress>;
  currentSection: HW4SectionId;
  startedAt?: number;
  completedAt?: number;
  totalScore: number;
  totalPossible: number;
}

// HW4 Section metadata
export interface HW4SectionMeta {
  id: HW4SectionId;
  title: string;
  description: string;
  questionCount: number;
  helpPage: string;
}

// Helper type for creating initial HW4 section state
export const createInitialHW4SectionProgress = (
  sectionId: HW4SectionId,
  totalQuestions: number
): HW4SectionProgress => ({
  sectionId,
  status: 'not_started',
  currentIndex: 0,
  answers: [],
  score: 0,
  totalQuestions,
});

export const createInitialHomework4Progress = (): Homework4Progress => ({
  id: 'hw4',
  status: 'not_started',
  sections: {
    1: createInitialHW4SectionProgress(1, 10),  // Future Active Indicative
    2: createInitialHW4SectionProgress(2, 12),  // Present Active Masculine Participles
    3: createInitialHW4SectionProgress(3, 12),  // 1st Aorist Active Masculine Participles
    4: createInitialHW4SectionProgress(4, 18),  // 1st & 2nd Person Personal Pronouns
    5: createInitialHW4SectionProgress(5, 10),  // Conjunctions
    6: createInitialHW4SectionProgress(6, 10),  // Verse Translation (Mark 1–4)
  },
  currentSection: 1,
  totalScore: 0,
  totalPossible: 72,
});

// Section metadata for HW4
export const HW4_SECTION_META: Record<HW4SectionId, HW4SectionMeta> = {
  1: {
    id: 1,
    title: 'Future Active Indicative (λύω)',
    description: 'Parse future active indicative verb forms of λύω',
    questionCount: 10,
    helpPage: '/homework/help/verb-paradigms',
  },
  2: {
    id: 2,
    title: 'Present Active Participles (Masculine)',
    description: 'Parse present active masculine participle forms of λύω',
    questionCount: 12,
    helpPage: '/homework/help/verb-paradigms',
  },
  3: {
    id: 3,
    title: '1st Aorist Active Participles (Masculine)',
    description: 'Parse first aorist active masculine participle forms of λύω',
    questionCount: 12,
    helpPage: '/homework/help/verb-paradigms',
  },
  4: {
    id: 4,
    title: '1st & 2nd Person Pronouns',
    description: 'Parse 1st and 2nd person personal pronoun forms',
    questionCount: 18,
    helpPage: '/homework/help/pronouns',
  },
  5: {
    id: 5,
    title: 'Conjunctions',
    description: 'Learn Greek conjunctions: meanings, usage, and distinctions',
    questionCount: 10,
    helpPage: '/homework/help/grammar-terms',
  },
  6: {
    id: 6,
    title: 'Verse Translation',
    description: 'Translate 10 verses from Mark 1–4 using grammar from HW1–4',
    questionCount: 10,
    helpPage: '/homework/help/verb-paradigms',
  },
};

// =============================================================================
// HOMEWORK 5 TYPES
// =============================================================================

// HW5 Section IDs (6 sections)
export type HW5SectionId = 1 | 2 | 3 | 4 | 5 | 6;

// HW5 Section progress
export interface HW5SectionProgress {
  sectionId: HW5SectionId;
  status: 'not_started' | 'in_progress' | 'completed';
  currentIndex: number;
  answers: QuestionAnswer[];
  score: number;
  totalQuestions: number;
  startedAt?: number;
  completedAt?: number;
}

// Overall homework 5 progress
export interface Homework5Progress {
  id: 'hw5';
  status: 'not_started' | 'in_progress' | 'completed';
  sections: Record<HW5SectionId, HW5SectionProgress>;
  currentSection: HW5SectionId;
  startedAt?: number;
  completedAt?: number;
  totalScore: number;
  totalPossible: number;
}

// HW5 Section metadata
export interface HW5SectionMeta {
  id: HW5SectionId;
  title: string;
  description: string;
  questionCount: number;
  helpPage: string;
}

// Helper type for creating initial HW5 section state
export const createInitialHW5SectionProgress = (
  sectionId: HW5SectionId,
  totalQuestions: number
): HW5SectionProgress => ({
  sectionId,
  status: 'not_started',
  currentIndex: 0,
  answers: [],
  score: 0,
  totalQuestions,
});

export const createInitialHomework5Progress = (): Homework5Progress => ({
  id: 'hw5',
  status: 'not_started',
  sections: {
    1: createInitialHW5SectionProgress(1, 12),  // Imperative Mood
    2: createInitialHW5SectionProgress(2, 16),  // Passive Voice
    3: createInitialHW5SectionProgress(3, 16),  // ἔρχομαι (was Section 4)
    4: createInitialHW5SectionProgress(4, 22),  // Future Tense (was Section 5)
    5: createInitialHW5SectionProgress(5, 14),  // Aorist Passive (NEW)
    6: createInitialHW5SectionProgress(6, 10),  // Verse Practice
  },
  currentSection: 1,
  totalScore: 0,
  totalPossible: 90,
});

// Section metadata for HW5
export const HW5_SECTION_META: Record<HW5SectionId, HW5SectionMeta> = {
  1: {
    id: 1,
    title: 'Imperative Mood (λύω)',
    description: 'Parse present and aorist active imperative verb forms',
    questionCount: 12,
    helpPage: '/homework/help/verb-paradigms',
  },
  2: {
    id: 2,
    title: 'Passive Voice (λύω)',
    description: 'Parse present and imperfect passive indicative verb forms',
    questionCount: 16,
    helpPage: '/homework/help/verb-paradigms',
  },
  3: {
    id: 3,
    title: 'ἔρχομαι',
    description: 'Parse present and imperfect forms of the deponent verb ἔρχομαι',
    questionCount: 16,
    helpPage: '/homework/help/verb-paradigms',
  },
  4: {
    id: 4,
    title: 'Future Tense (λύω + εἰμί)',
    description: 'Parse future middle, future passive, and future of εἰμί',
    questionCount: 22,
    helpPage: '/homework/help/verb-paradigms',
  },
  5: {
    id: 5,
    title: 'Aorist Passive Indicative (λύω)',
    description: 'Parse aorist passive indicative forms with -θη- marker',
    questionCount: 14,
    helpPage: '/homework/help/verb-paradigms',
  },
  6: {
    id: 6,
    title: 'Verse Practice',
    description: 'Translate 10 verses featuring imperative, passive, aorist passive, and future forms',
    questionCount: 10,
    helpPage: '/homework/help/verb-paradigms',
  },
};

// =============================================================================
// HOMEWORK 6 TYPES
// =============================================================================

// HW6 Section IDs (6 sections)
export type HW6SectionId = 1 | 2 | 3 | 4 | 5 | 6;

// HW6 Section progress
export interface HW6SectionProgress {
  sectionId: HW6SectionId;
  status: 'not_started' | 'in_progress' | 'completed';
  currentIndex: number;
  answers: QuestionAnswer[];
  score: number;
  totalQuestions: number;
  startedAt?: number;
  completedAt?: number;
}

// Overall homework 6 progress
export interface Homework6Progress {
  id: 'hw6';
  status: 'not_started' | 'in_progress' | 'completed';
  sections: Record<HW6SectionId, HW6SectionProgress>;
  currentSection: HW6SectionId;
  startedAt?: number;
  completedAt?: number;
  totalScore: number;
  totalPossible: number;
}

// HW6 Section metadata
export interface HW6SectionMeta {
  id: HW6SectionId;
  title: string;
  description: string;
  questionCount: number;
  helpPage: string;
}

// Helper type for creating initial HW6 section state
export const createInitialHW6SectionProgress = (
  sectionId: HW6SectionId,
  totalQuestions: number
): HW6SectionProgress => ({
  sectionId,
  status: 'not_started',
  currentIndex: 0,
  answers: [],
  score: 0,
  totalQuestions,
});

export const createInitialHomework6Progress = (): Homework6Progress => ({
  id: 'hw6',
  status: 'not_started',
  sections: {
    1: createInitialHW6SectionProgress(1, 12),  // Present Active Fem & Neut Participles
    2: createInitialHW6SectionProgress(2, 12),  // εἰμί Participles
    3: createInitialHW6SectionProgress(3, 12),  // Aorist Active Fem & Neut Participles
    4: createInitialHW6SectionProgress(4, 20),  // Demonstrative Pronouns
    5: createInitialHW6SectionProgress(5, 14),  // Reflexive & Relative Pronouns
    6: createInitialHW6SectionProgress(6, 10),  // Verse Practice
  },
  currentSection: 1,
  totalScore: 0,
  totalPossible: 80,
});

// Section metadata for HW6
export const HW6_SECTION_META: Record<HW6SectionId, HW6SectionMeta> = {
  1: {
    id: 1,
    title: 'Present Active Participles (Fem & Neut)',
    description: 'Parse present active feminine (λύουσα) and neuter (λῦον) participle forms',
    questionCount: 12,
    helpPage: '/homework/help/verb-paradigms',
  },
  2: {
    id: 2,
    title: 'εἰμί Participles (ὤν/οὖσα/ὄν)',
    description: 'Parse present participle forms of εἰμί across all genders',
    questionCount: 12,
    helpPage: '/homework/help/verb-paradigms',
  },
  3: {
    id: 3,
    title: 'Aorist Active Participles (Fem & Neut)',
    description: 'Parse 1st aorist active feminine (λύσασα) and neuter (λῦσαν) participle forms',
    questionCount: 12,
    helpPage: '/homework/help/verb-paradigms',
  },
  4: {
    id: 4,
    title: 'Demonstrative Pronouns',
    description: 'Parse forms of οὗτος (this) and ἐκεῖνος (that)',
    questionCount: 20,
    helpPage: '/homework/help/pronouns',
  },
  5: {
    id: 5,
    title: 'Reflexive & Relative Pronouns',
    description: 'Parse reflexive (ἐμαυτοῦ, σεαυτοῦ, ἑαυτοῦ) and relative (ὅς, ἥ, ὅ) pronoun forms',
    questionCount: 14,
    helpPage: '/homework/help/pronouns',
  },
  6: {
    id: 6,
    title: 'Verse Practice',
    description: 'Translate 10 verses featuring participles, demonstratives, and pronouns',
    questionCount: 10,
    helpPage: '/homework/help/verb-paradigms',
  },
};

// Homework submission for teacher dashboard
export interface HomeworkSubmission {
  studentUid: string;
  homeworkId: string;
  status: 'completed';
  completedAt: Date;
  score: number;
  totalPossible: number;
  percentage: number;
  displayName: string | null;
  email: string | null;
  // Sections data for detailed view
  sections?: Record<string, {
    score: number;
    totalQuestions: number;
    status: string;
  }>;
}
