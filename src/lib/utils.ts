import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get random items from an array
 */
export function getRandomItems<T>(array: T[], count: number): T[] {
  return shuffle(array).slice(0, count);
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if answer is close enough (fuzzy match)
 * Allows for minor typos
 */
export function fuzzyMatch(input: string, target: string, threshold = 0.8): boolean {
  const normalizedInput = input.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();

  if (normalizedInput === normalizedTarget) return true;

  const maxLength = Math.max(normalizedInput.length, normalizedTarget.length);
  if (maxLength === 0) return true;

  const distance = levenshteinDistance(normalizedInput, normalizedTarget);
  const similarity = 1 - distance / maxLength;

  return similarity >= threshold;
}

/**
 * Format a date relative to now
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  return `In ${Math.ceil(diffDays / 30)} months`;
}

/**
 * Format milliseconds as mm:ss
 */
export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Common English synonyms for flexible answer matching
 */
const SYNONYM_GROUPS: string[][] = [
  ['and', 'also', 'even', 'too'],
  ['but', 'however', 'yet', 'nevertheless'],
  ['say', 'speak', 'tell', 'talk'],
  ['come', 'go', 'arrive'],
  ['see', 'look', 'behold', 'observe', 'perceive'],
  ['know', 'understand', 'perceive', 'recognize'],
  ['make', 'do', 'create', 'produce'],
  ['give', 'grant', 'bestow', 'offer'],
  ['take', 'receive', 'accept', 'get'],
  ['have', 'hold', 'possess', 'own'],
  ['man', 'person', 'human', 'mankind', 'people'],
  ['lord', 'master', 'sir'],
  ['god', 'deity', 'divine'],
  ['good', 'excellent', 'fine', 'noble'],
  ['bad', 'evil', 'wicked'],
  ['great', 'large', 'big', 'mighty'],
  ['small', 'little', 'minor'],
  ['love', 'charity', 'affection'],
  ['faith', 'belief', 'trust'],
  ['sin', 'transgression', 'offense', 'wrongdoing'],
  ['life', 'living'],
  ['death', 'dying'],
  ['truth', 'reality', 'verity'],
  ['word', 'message', 'saying', 'speech'],
  ['spirit', 'breath', 'wind'],
  ['soul', 'self', 'life'],
  ['body', 'flesh'],
  ['heart', 'mind', 'inner self'],
  ['world', 'earth', 'universe', 'cosmos'],
  ['heaven', 'sky'],
  ['kingdom', 'reign', 'rule'],
  ['power', 'authority', 'ability', 'might'],
  ['glory', 'honor', 'splendor'],
  ['grace', 'favor', 'kindness'],
  ['peace', 'harmony', 'rest'],
  ['joy', 'gladness', 'happiness', 'delight'],
  ['hope', 'expectation'],
  ['righteousness', 'justice'],
  ['salvation', 'deliverance', 'rescue'],
  ['judgment', 'decision', 'verdict'],
  ['law', 'commandment', 'rule'],
  ['prophet', 'seer'],
  ['apostle', 'messenger', 'envoy'],
  ['disciple', 'student', 'follower', 'learner'],
  ['church', 'assembly', 'congregation'],
  ['father', 'dad', 'parent'],
  ['mother', 'mom', 'parent'],
  ['son', 'child', 'offspring'],
  ['brother', 'sibling'],
  ['name', 'title'],
  ['day', 'time'],
  ['hour', 'time', 'moment'],
  ['way', 'road', 'path'],
  ['house', 'home', 'household'],
  ['work', 'deed', 'action', 'labor'],
  ['sign', 'miracle', 'wonder'],
  ['voice', 'sound'],
  ['resurrection', 'rising'],
];

/**
 * Find synonyms for a word
 */
function getSynonyms(word: string): string[] {
  const lower = word.toLowerCase();
  for (const group of SYNONYM_GROUPS) {
    if (group.includes(lower)) {
      return group;
    }
  }
  return [lower];
}

/**
 * Parse a gloss string into individual acceptable answers
 * Handles formats like "and, also, even" or "I say, speak" or "man, human being"
 */
function parseGlossToAnswers(gloss: string): string[] {
  const answers: string[] = [];

  // Split by common separators
  const parts = gloss.split(/[,;\/]|\s+or\s+/i).map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    // Add the part as-is
    answers.push(part.toLowerCase());

    // Handle "I verb" pattern - also accept just the verb
    if (part.toLowerCase().startsWith('i ')) {
      answers.push(part.slice(2).toLowerCase());
    }

    // Handle "to verb" pattern - also accept just the verb
    if (part.toLowerCase().startsWith('to ')) {
      answers.push(part.slice(3).toLowerCase());
    }

    // Add individual words for multi-word parts
    const words = part.split(/\s+/);
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (cleanWord.length > 2) {
        answers.push(cleanWord);
      }
    }
  }

  return [...new Set(answers)]; // Remove duplicates
}

/**
 * Check a typed answer against a gloss with flexible matching
 * Returns: 'exact' | 'correct' | 'close' | 'incorrect'
 */
export function checkTypingAnswer(
  userInput: string,
  gloss: string,
  definition?: string
): 'exact' | 'correct' | 'close' | 'incorrect' {
  const input = userInput.trim().toLowerCase();
  const glossLower = gloss.toLowerCase();

  // Empty input is incorrect
  if (!input) return 'incorrect';

  // Exact match with full gloss
  if (input === glossLower) return 'exact';

  // Parse gloss into acceptable answers
  const acceptableAnswers = parseGlossToAnswers(gloss);

  // Also parse definition if provided
  if (definition) {
    const defAnswers = parseGlossToAnswers(definition);
    acceptableAnswers.push(...defAnswers);
  }

  // Check for exact match with any acceptable answer
  if (acceptableAnswers.includes(input)) {
    return 'correct';
  }

  // Check if input matches any synonym of acceptable answers
  for (const answer of acceptableAnswers) {
    const synonyms = getSynonyms(answer);
    if (synonyms.includes(input)) {
      return 'correct';
    }
  }

  // Check if user input is a synonym of any word in the gloss
  const inputSynonyms = getSynonyms(input);
  for (const answer of acceptableAnswers) {
    if (inputSynonyms.includes(answer)) {
      return 'correct';
    }
  }

  // Fuzzy match against the full gloss
  if (fuzzyMatch(input, glossLower, 0.8)) {
    return 'close';
  }

  // Fuzzy match against any acceptable answer
  for (const answer of acceptableAnswers) {
    if (fuzzyMatch(input, answer, 0.75)) {
      return 'close';
    }
  }

  // Check for partial word matches (user typed part of the answer)
  // Require at least 50% of the answer length AND minimum 3 characters
  if (input.length >= 3) {
    for (const answer of acceptableAnswers) {
      const minLength = Math.max(3, Math.floor(answer.length * 0.5));
      if (input.length >= minLength && (answer.startsWith(input) || answer.includes(input))) {
        return 'close';
      }
    }
  }

  return 'incorrect';
}

/**
 * Local storage helper with JSON serialization
 */
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Log storage errors - likely quota exceeded
      console.warn('localStorage.setItem failed:', error);
      console.warn('Storage may be full. Some data may not be saved.');
    }
  },
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};
