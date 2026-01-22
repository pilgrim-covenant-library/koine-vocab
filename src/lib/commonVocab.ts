import vocabularyData from '@/data/vocabulary.json';
import type { VocabularyWord } from '@/types';

/**
 * Number of words to include in the "Common NT Vocab" challenge.
 * These are the most frequently occurring words in the New Testament.
 */
export const COMMON_VOCAB_COUNT = 100;

// Module-level cache to avoid re-sorting on every call
let cachedCommonVocab: VocabularyWord[] | null = null;

/**
 * Get the top 100 most frequently occurring words in the New Testament,
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
 * Get a Set of word IDs for the top 100 common NT vocabulary words.
 * Useful for efficient lookup when calculating progress.
 */
export function getCommonNTVocabIds(): Set<string> {
  return new Set(getCommonNTVocab().map((w) => w.id));
}
