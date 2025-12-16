import type { NTVerse, TranslationResult } from '@/types';

/**
 * Translation Scoring Algorithm
 *
 * Evaluates user translations against reference translations
 * Scoring is out of 10 based on:
 * - Key term coverage (40%)
 * - Semantic similarity (35%)
 * - Completeness (25%)
 */

// Common words to ignore when comparing (articles, prepositions, etc.)
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'that', 'which', 'who',
  'whom', 'this', 'these', 'those', 'it', 'its', 'his', 'her', 'their',
  'my', 'your', 'our', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him',
  'us', 'them', 'not', 'no', 'so', 'if', 'then', 'also', 'just', 'only',
  'now', 'even', 'very', 'too', 'here', 'there', 'when', 'where', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
  'such', 'any', 'own'
]);

// Synonym mappings for common biblical terms
const SYNONYMS: Record<string, string[]> = {
  'lord': ['master', 'sovereign'],
  'god': ['deity', 'divine'],
  'faith': ['belief', 'trust'],
  'believe': ['trust', 'have faith'],
  'love': ['charity', 'affection'],
  'sin': ['transgression', 'wrongdoing', 'iniquity'],
  'save': ['deliver', 'rescue'],
  'salvation': ['deliverance', 'redemption'],
  'grace': ['favor', 'unmerited favor'],
  'righteous': ['just', 'upright'],
  'righteousness': ['justice', 'uprightness'],
  'eternal': ['everlasting', 'forever'],
  'life': ['living'],
  'death': ['die', 'dying'],
  'spirit': ['ghost'],
  'holy': ['sacred', 'divine'],
  'kingdom': ['reign', 'rule'],
  'heaven': ['heavens', 'sky'],
  'word': ['message', 'logos'],
  'truth': ['true', 'reality'],
  'light': ['brightness', 'illumination'],
  'darkness': ['dark', 'shadow'],
  'glory': ['splendor', 'majesty', 'glorious'],
  'power': ['might', 'strength', 'authority'],
  'son': ['child'],
  'father': ['dad', 'papa'],
  'christ': ['messiah', 'anointed'],
  'jesus': ['yeshua'],
  'disciples': ['followers', 'students'],
  'apostle': ['messenger', 'sent one'],
  'repent': ['turn', 'change mind'],
  'baptize': ['immerse', 'wash'],
  'forgive': ['pardon', 'absolve'],
  'forgiveness': ['pardon', 'absolution'],
  'confess': ['acknowledge', 'admit'],
  'witness': ['testimony', 'testify'],
  'blessed': ['happy', 'fortunate'],
  'wrath': ['anger', 'fury'],
  'mercy': ['compassion', 'pity'],
  'peace': ['tranquility', 'harmony'],
  'joy': ['gladness', 'happiness', 'rejoice'],
  'hope': ['expectation', 'trust'],
  'flesh': ['body', 'human nature'],
  'world': ['cosmos', 'earth'],
  'soul': ['life', 'self'],
  'heart': ['mind', 'inner being'],
  'church': ['assembly', 'congregation', 'ekklesia'],
  'scripture': ['scriptures', 'writings', 'bible'],
  'prophet': ['prophets'],
  'law': ['commandment', 'torah'],
  'covenant': ['testament', 'agreement'],
  'sacrifice': ['offering'],
  'priest': ['priesthood'],
  'temple': ['sanctuary'],
  'worship': ['praise', 'adore'],
  'pray': ['prayer'],
  'preach': ['proclaim', 'announce'],
  'gospel': ['good news', 'good tidings'],
  'resurrection': ['raised', 'rise'],
};

/**
 * Normalize text for comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();
}

/**
 * Tokenize text into meaningful words
 */
function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Check if two words are synonyms or the same
 */
function areSynonyms(word1: string, word2: string): boolean {
  if (word1 === word2) return true;

  // Check direct synonyms
  const synonyms1 = SYNONYMS[word1] || [];
  const synonyms2 = SYNONYMS[word2] || [];

  if (synonyms1.includes(word2) || synonyms2.includes(word1)) return true;

  // Check if they share a synonym
  for (const syn of synonyms1) {
    if (synonyms2.includes(syn)) return true;
  }

  return false;
}

/**
 * Check if a word stem matches
 */
function stemMatch(word1: string, word2: string): boolean {
  // Simple stemming - check if one is a prefix of the other (min 4 chars)
  if (word1.length < 4 || word2.length < 4) return word1 === word2;

  const minLen = Math.min(word1.length, word2.length);
  const compareLen = Math.max(4, Math.floor(minLen * 0.7));

  return word1.slice(0, compareLen) === word2.slice(0, compareLen);
}

/**
 * Calculate Levenshtein distance (for typo tolerance)
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Check if words match (with typo tolerance)
 */
function wordsMatch(word1: string, word2: string): boolean {
  if (word1 === word2) return true;
  if (areSynonyms(word1, word2)) return true;
  if (stemMatch(word1, word2)) return true;

  // Allow small typos for longer words
  if (word1.length >= 5 && word2.length >= 5) {
    const distance = levenshteinDistance(word1, word2);
    const maxDistance = Math.floor(Math.max(word1.length, word2.length) * 0.2);
    if (distance <= Math.max(1, maxDistance)) return true;
  }

  return false;
}

/**
 * Calculate key terms coverage score
 */
function calculateKeyTermsScore(
  userTokens: string[],
  keyTerms: string[]
): { score: number; found: string[]; missed: string[] } {
  const found: string[] = [];
  const missed: string[] = [];

  for (const term of keyTerms) {
    const termTokens = tokenize(term);
    let termFound = false;

    for (const termToken of termTokens) {
      for (const userToken of userTokens) {
        if (wordsMatch(termToken, userToken)) {
          termFound = true;
          break;
        }
      }
      if (termFound) break;
    }

    if (termFound) {
      found.push(term);
    } else {
      missed.push(term);
    }
  }

  const score = keyTerms.length > 0 ? found.length / keyTerms.length : 1;
  return { score, found, missed };
}

/**
 * Calculate semantic similarity between user and reference translation
 */
function calculateSemanticScore(
  userTokens: string[],
  referenceTokens: string[]
): number {
  if (referenceTokens.length === 0) return 1;
  if (userTokens.length === 0) return 0;

  let matchCount = 0;
  const matchedRef = new Set<number>();

  for (const userToken of userTokens) {
    for (let i = 0; i < referenceTokens.length; i++) {
      if (!matchedRef.has(i) && wordsMatch(userToken, referenceTokens[i])) {
        matchCount++;
        matchedRef.add(i);
        break;
      }
    }
  }

  // Precision: how many user words match reference
  const precision = matchCount / userTokens.length;
  // Recall: how many reference words were matched
  const recall = matchCount / referenceTokens.length;

  // F1-like score with more weight on recall
  if (precision + recall === 0) return 0;
  return (1.5 * precision * recall) / (0.5 * precision + recall);
}

/**
 * Calculate completeness score
 */
function calculateCompletenessScore(
  userText: string,
  referenceText: string
): number {
  const userLen = normalizeText(userText).length;
  const refLen = normalizeText(referenceText).length;

  if (refLen === 0) return 1;
  if (userLen === 0) return 0;

  // Penalize if too short or too long
  const ratio = userLen / refLen;

  if (ratio < 0.5) {
    // Too short
    return ratio * 2; // 0-1 for 0-50% of reference length
  } else if (ratio > 2) {
    // Too long
    return Math.max(0, 1 - (ratio - 2) * 0.5);
  } else if (ratio >= 0.7 && ratio <= 1.5) {
    // Good range
    return 1;
  } else {
    // Slightly short or long
    return 0.9;
  }
}

/**
 * Generate feedback based on score
 */
function generateFeedback(score: number, keyTermsMissed: string[]): string {
  if (score >= 9) {
    return 'Excellent translation! You captured the meaning accurately.';
  } else if (score >= 7) {
    return 'Good translation! Minor improvements possible.';
  } else if (score >= 5) {
    return 'Decent attempt. Review the key theological terms.';
  } else if (score >= 3) {
    return 'Needs improvement. Focus on the main concepts.';
  } else {
    return 'Keep practicing! Try to identify the key words first.';
  }
}

/**
 * Generate improvement suggestions
 */
function generateSuggestions(
  keyTermsMissed: string[],
  userTokens: string[],
  referenceTokens: string[]
): string[] {
  const suggestions: string[] = [];

  if (keyTermsMissed.length > 0) {
    const missedList = keyTermsMissed.slice(0, 3).join(', ');
    suggestions.push(`Include key terms: ${missedList}`);
  }

  if (userTokens.length < referenceTokens.length * 0.5) {
    suggestions.push('Your translation seems incomplete. Try to express the full meaning.');
  }

  if (userTokens.length > referenceTokens.length * 2) {
    suggestions.push('Your translation is quite long. Try to be more concise.');
  }

  return suggestions;
}

/**
 * Main scoring function
 * Returns a score from 0-10 with detailed feedback
 */
export function scoreTranslation(
  verse: NTVerse,
  userTranslation: string
): TranslationResult {
  const userTokens = tokenize(userTranslation);
  const referenceTokens = tokenize(verse.referenceTranslation);

  // Handle empty submission
  if (userTranslation.trim().length === 0) {
    return {
      score: 0,
      feedback: 'Please enter a translation.',
      keyTermsFound: [],
      keyTermsMissed: verse.keyTerms,
      suggestions: ['Try translating the Greek text word by word first.'],
    };
  }

  // Calculate component scores
  const keyTermsResult = calculateKeyTermsScore(userTokens, verse.keyTerms);
  const semanticScore = calculateSemanticScore(userTokens, referenceTokens);
  const completenessScore = calculateCompletenessScore(userTranslation, verse.referenceTranslation);

  // Weighted combination (40% key terms, 35% semantic, 25% completeness)
  const rawScore =
    keyTermsResult.score * 0.4 +
    semanticScore * 0.35 +
    completenessScore * 0.25;

  // Convert to 0-10 scale and round to 1 decimal
  const score = Math.round(rawScore * 100) / 10;

  // Generate feedback and suggestions
  const feedback = generateFeedback(score, keyTermsResult.missed);
  const suggestions = generateSuggestions(
    keyTermsResult.missed,
    userTokens,
    referenceTokens
  );

  return {
    score: Math.min(10, Math.max(0, score)),
    feedback,
    keyTermsFound: keyTermsResult.found,
    keyTermsMissed: keyTermsResult.missed,
    suggestions,
  };
}

/**
 * Calculate XP earned from translation score
 */
export function calculateTranslationXP(score: number, difficulty: number): number {
  // Base XP is 30, scaled by score and difficulty
  const baseXP = 30;
  const scoreMultiplier = score / 10;
  const difficultyBonus = 1 + (difficulty - 1) * 0.25; // 1x, 1.25x, 1.5x for difficulties 1-3

  return Math.round(baseXP * scoreMultiplier * difficultyBonus);
}
