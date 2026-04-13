import { scoreTranslation } from '@/lib/translation';
import type { NTVerse } from '@/types';

// Minimal verse factory for testing
function makeVerse(overrides: Partial<NTVerse> = {}): NTVerse {
  return {
    id: 'test-v1',
    type: 'translation',
    reference: 'Test 1:1',
    greek: 'τεστ',
    referenceTranslation: 'The test reference translation',
    keyTerms: ['test', 'reference'],
    difficulty: 1,
    ...overrides,
  } as NTVerse;
}

describe('scoreTranslation', () => {
  describe('stop-word key terms are matchable', () => {
    it('should match key term "who" when user writes "who"', () => {
      const verse = makeVerse({
        referenceTranslation: 'But who do you say that I am?',
        keyTerms: ['who', 'you', 'say', 'am'],
      });

      const result = scoreTranslation(verse, 'But who do you say that I am?');

      expect(result.keyTermsFound).toContain('who');
      expect(result.keyTermsFound).toContain('you');
      expect(result.keyTermsMissed).not.toContain('who');
      expect(result.keyTermsMissed).not.toContain('you');
    });

    it('should match key term "all" when user writes "all"', () => {
      const verse = makeVerse({
        referenceTranslation: 'For all have sinned and fall short of the glory of God.',
        keyTerms: ['all', 'sinned', 'fall short', 'glory', 'God'],
      });

      const result = scoreTranslation(verse, 'For all have sinned and fall short of the glory of God.');

      expect(result.keyTermsFound).toContain('all');
      expect(result.keyTermsMissed).not.toContain('all');
    });

    it('should match key term "only" when user writes "only"', () => {
      const verse = makeVerse({
        referenceTranslation: 'And this is eternal life, that they know you the only true God.',
        keyTerms: ['eternal', 'life', 'know', 'only', 'true', 'God'],
      });

      const result = scoreTranslation(verse, 'And this is eternal life, that they know you the only true God.');

      expect(result.keyTermsFound).toContain('only');
      expect(result.keyTermsMissed).not.toContain('only');
    });
  });

  describe('word order independence', () => {
    it('should score equally regardless of word order', () => {
      const verse = makeVerse({
        referenceTranslation: 'God loved the world.',
        keyTerms: ['loved', 'world', 'God'],
      });

      const result1 = scoreTranslation(verse, 'God loved the world.');
      const result2 = scoreTranslation(verse, 'The world God loved.');

      // Both should find the same key terms
      expect(result1.keyTermsFound.sort()).toEqual(result2.keyTermsFound.sort());
      expect(result1.keyTermsMissed).toEqual(result2.keyTermsMissed);
    });
  });
});
