import vocabularyData from '@/data/vocabulary.json';
import type { VocabularyWord } from '@/types';

/**
 * Number of words to include in the "Common NT Vocab" challenge.
 * These are the 300 most frequently occurring words in the New Testament.
 */
export const COMMON_VOCAB_COUNT = 300;

/** Number of words per section */
export const WORDS_PER_SECTION = 30;

/** Total number of sections */
export const SECTION_COUNT = COMMON_VOCAB_COUNT / WORDS_PER_SECTION; // 10

/** Valid section IDs (1-10) */
export type CommonVocabSectionId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** Section metadata for the overview page */
export const COMMON_VOCAB_SECTION_META: Record<CommonVocabSectionId, { title: string; description: string }> = {
  1:  { title: 'Most Common (1–30)',     description: 'The 30 most frequent NT words — articles, conjunctions, core verbs' },
  2:  { title: 'Very Common (31–60)',    description: 'Essential prepositions, pronouns, and high-frequency nouns' },
  3:  { title: 'Very Common (61–90)',    description: 'Key verbs of motion, speech, and perception' },
  4:  { title: 'Common (91–120)',        description: 'Important adjectives, adverbs, and narrative verbs' },
  5:  { title: 'Common (121–150)',       description: 'Theological terms and discourse markers' },
  6:  { title: 'Frequent (151–180)',     description: 'Words for people, places, and relationships' },
  7:  { title: 'Frequent (181–210)',     description: 'Verbs of action, emotion, and judgment' },
  8:  { title: 'Moderately Common (211–240)', description: 'Expanding your working vocabulary' },
  9:  { title: 'Moderately Common (241–270)', description: 'Less common but still important NT words' },
  10: { title: 'Building Breadth (271–300)',  description: 'Completing the top 300 most frequent words' },
};

// Module-level cache to avoid re-sorting on every call
let cachedCommonVocab: VocabularyWord[] | null = null;

/**
 * Get the top 300 most frequently occurring words in the New Testament,
 * sorted by frequency (highest first).
 */
export function getCommonNTVocab(): VocabularyWord[] {
  if (!cachedCommonVocab) {
    const words = vocabularyData.words as VocabularyWord[];
    cachedCommonVocab = [...words]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, COMMON_VOCAB_COUNT);
  }
  return cachedCommonVocab;
}

/**
 * Get a Set of word IDs for the top 300 common NT vocabulary words.
 * Useful for efficient lookup when calculating progress.
 */
export function getCommonNTVocabIds(): Set<string> {
  return new Set(getCommonNTVocab().map((w) => w.id));
}

/**
 * Get the 30 words for a given section (1-10).
 * Section 1 = words ranked 1-30 (most frequent), Section 10 = words ranked 271-300.
 */
export function getCommonVocabSection(sectionId: CommonVocabSectionId): VocabularyWord[] {
  const allWords = getCommonNTVocab();
  const start = (sectionId - 1) * WORDS_PER_SECTION;
  return allWords.slice(start, start + WORDS_PER_SECTION);
}

/**
 * Get the total number of sections.
 */
export function getCommonVocabSectionCount(): number {
  return SECTION_COUNT;
}
