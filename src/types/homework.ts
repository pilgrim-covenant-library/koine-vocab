// Homework Type Definitions

export type SectionId = 1 | 2 | 3 | 4 | 5;

export type QuestionType = 'transliteration' | 'verse' | 'mcq';

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
  options: string[];
  correctIndex: number;
  explanation: string;
  category?: string;   // e.g., "noun", "nominative", "masculine"
}

// Union type for all questions
export type HomeworkQuestion = TransliterationQuestion | VerseQuestion | MCQQuestion;

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

// Section metadata
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
