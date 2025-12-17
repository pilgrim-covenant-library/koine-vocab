import vocabularyData from '@/data/vocabulary.json';
import type { VocabularyWord } from '@/types';

const allWords = vocabularyData.words as VocabularyWord[];

// Find words with similar meanings (based on shared words in gloss)
export function findSimilarMeaning(word: VocabularyWord, limit = 5): VocabularyWord[] {
  const glossWords = word.gloss.toLowerCase().split(/[,;\s]+/).filter(w => w.length > 2);

  const scored = allWords
    .filter(w => w.id !== word.id)
    .map(w => {
      const wGlossWords = w.gloss.toLowerCase().split(/[,;\s]+/);
      const matches = glossWords.filter(gw => wGlossWords.some(wgw => wgw.includes(gw) || gw.includes(wgw)));
      return { word: w, score: matches.length };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(s => s.word);
}

// Find words with the same part of speech and tier
export function findSameCategory(word: VocabularyWord, limit = 5): VocabularyWord[] {
  return allWords
    .filter(w =>
      w.id !== word.id &&
      w.partOfSpeech === word.partOfSpeech &&
      Math.abs(w.tier - word.tier) <= 1
    )
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
}

// Find words with similar Strong's number (related root)
export function findRelatedRoot(word: VocabularyWord, limit = 5): VocabularyWord[] {
  // Extract the base number from Strong's (e.g., G123 from G1234)
  const strongsNum = parseInt(word.strongs.replace(/\D/g, ''));
  const strongsPrefix = word.strongs.charAt(0);

  // Look for words within a range of Strong's numbers (likely related etymologically)
  const range = 50;

  return allWords
    .filter(w => {
      if (w.id === word.id) return false;
      const wNum = parseInt(w.strongs.replace(/\D/g, ''));
      const wPrefix = w.strongs.charAt(0);
      return wPrefix === strongsPrefix && Math.abs(wNum - strongsNum) <= range && Math.abs(wNum - strongsNum) > 0;
    })
    .sort((a, b) => {
      const aNum = parseInt(a.strongs.replace(/\D/g, ''));
      const bNum = parseInt(b.strongs.replace(/\D/g, ''));
      return Math.abs(aNum - strongsNum) - Math.abs(bNum - strongsNum);
    })
    .slice(0, limit);
}

// Find words with similar frequency (study companions)
export function findSimilarFrequency(word: VocabularyWord, limit = 5): VocabularyWord[] {
  return allWords
    .filter(w => w.id !== word.id)
    .sort((a, b) => {
      const aDiff = Math.abs(a.frequency - word.frequency);
      const bDiff = Math.abs(b.frequency - word.frequency);
      return aDiff - bDiff;
    })
    .slice(0, limit);
}

// Get all relationships for a word
export interface WordRelations {
  similarMeaning: VocabularyWord[];
  sameCategory: VocabularyWord[];
  relatedRoot: VocabularyWord[];
  similarFrequency: VocabularyWord[];
}

export function getWordRelations(word: VocabularyWord): WordRelations {
  return {
    similarMeaning: findSimilarMeaning(word),
    sameCategory: findSameCategory(word),
    relatedRoot: findRelatedRoot(word),
    similarFrequency: findSimilarFrequency(word),
  };
}

// Find word by ID
export function findWordById(id: string): VocabularyWord | undefined {
  return allWords.find(w => w.id === id);
}
