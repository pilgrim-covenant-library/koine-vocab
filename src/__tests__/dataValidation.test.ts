/**
 * Tests for Data Validation System
 *
 * Tests comprehensive type checking, NaN/Infinity detection,
 * schema validation, and automatic sanitization.
 */

import {
  isValidNumber,
  isPositiveNumber,
  isValidDate,
  isISODateString,
  isWordProgress,
  isUserStats,
  sanitizeNumber,
  sanitizeDate,
  sanitizeArray,
  detectDataIssues,
  sanitizeWordProgress,
  sanitizeUserStats,
  sanitizeProgress,
  validateUserStoreState,
  deepSanitize,
} from '@/lib/dataValidation';

describe('Type Guards', () => {
  describe('isValidNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isValidNumber(0)).toBe(true);
      expect(isValidNumber(42)).toBe(true);
      expect(isValidNumber(-10)).toBe(true);
      expect(isValidNumber(3.14159)).toBe(true);
    });

    it('should return false for NaN and Infinity', () => {
      expect(isValidNumber(NaN)).toBe(false);
      expect(isValidNumber(Infinity)).toBe(false);
      expect(isValidNumber(-Infinity)).toBe(false);
    });

    it('should return false for non-numbers', () => {
      expect(isValidNumber('42')).toBe(false);
      expect(isValidNumber(null)).toBe(false);
      expect(isValidNumber(undefined)).toBe(false);
      expect(isValidNumber({})).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers and zero', () => {
      expect(isPositiveNumber(0)).toBe(true);
      expect(isPositiveNumber(42)).toBe(true);
      expect(isPositiveNumber(0.5)).toBe(true);
    });

    it('should return false for negative numbers', () => {
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber(-0.1)).toBe(false);
    });

    it('should return false for invalid numbers', () => {
      expect(isPositiveNumber(NaN)).toBe(false);
      expect(isPositiveNumber(Infinity)).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('2024-01-01'))).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate('2024-01-01')).toBe(false);
      expect(isValidDate(null)).toBe(false);
    });
  });

  describe('isISODateString', () => {
    it('should return true for valid ISO date strings', () => {
      expect(isISODateString('2024-01-01')).toBe(true);
      expect(isISODateString('2024-12-31T23:59:59.999Z')).toBe(true);
      expect(isISODateString('2024-06-15T12:30:00')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(isISODateString('01/01/2024')).toBe(false);
      expect(isISODateString('2024-1-1')).toBe(false);
      expect(isISODateString('not a date')).toBe(false);
      expect(isISODateString(123)).toBe(false);
    });
  });

  describe('isWordProgress', () => {
    it('should return true for valid WordProgress', () => {
      const validProgress = {
        wordId: 'word_123',
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        maxRepetitions: 5,
        timesReviewed: 0,
        timesCorrect: 0,
        lastQuality: 0,
        nextReview: new Date(),
        lastReview: null,
      };
      expect(isWordProgress(validProgress)).toBe(true);
    });

    it('should return false for invalid WordProgress', () => {
      expect(isWordProgress(null)).toBe(false);
      expect(isWordProgress({})).toBe(false);
      expect(isWordProgress({ wordId: 'word_123' })).toBe(false);
      expect(isWordProgress({ wordId: 'word_123', easeFactor: NaN })).toBe(false);
    });
  });

  describe('isUserStats', () => {
    it('should return true for valid UserStats', () => {
      const validStats = {
        xp: 100,
        level: 5,
        streak: 3,
        longestStreak: 10,
        wordsLearned: 50,
        wordsInProgress: 20,
        totalReviews: 200,
        correctReviews: 180,
        achievements: ['first_word', 'level_5'],
        lastStudyDate: new Date(),
      };
      expect(isUserStats(validStats)).toBe(true);
    });

    it('should return false for invalid UserStats', () => {
      expect(isUserStats(null)).toBe(false);
      expect(isUserStats({})).toBe(false);
      expect(isUserStats({ xp: -10 })).toBe(false);
      expect(isUserStats({ xp: NaN, level: 1 })).toBe(false);
    });
  });
});

describe('Sanitization Functions', () => {
  describe('sanitizeNumber', () => {
    it('should return valid numbers unchanged', () => {
      expect(sanitizeNumber(42, 0)).toBe(42);
      expect(sanitizeNumber(3.14, 0)).toBe(3.14);
    });

    it('should return default for invalid numbers', () => {
      expect(sanitizeNumber(NaN, 0)).toBe(0);
      expect(sanitizeNumber(Infinity, 10)).toBe(10);
      expect(sanitizeNumber('not a number', 5)).toBe(5);
    });

    it('should clamp to min/max range', () => {
      expect(sanitizeNumber(100, 0, 0, 50)).toBe(50);
      expect(sanitizeNumber(-10, 0, 0, 100)).toBe(0);
      expect(sanitizeNumber(25, 0, 0, 100)).toBe(25);
    });
  });

  describe('sanitizeDate', () => {
    it('should return valid dates', () => {
      const date = new Date('2024-01-01');
      expect(sanitizeDate(date)).toEqual(date);
    });

    it('should parse date strings', () => {
      const result = sanitizeDate('2024-01-01');
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString().split('T')[0]).toBe('2024-01-01');
    });

    it('should return default for invalid dates', () => {
      expect(sanitizeDate('invalid', null)).toBe(null);
      expect(sanitizeDate(new Date('invalid'), null)).toBe(null);
      expect(sanitizeDate(undefined, null)).toBe(null);
    });
  });

  describe('sanitizeArray', () => {
    const isString = (item: unknown): item is string => typeof item === 'string';

    it('should filter valid elements', () => {
      const input = ['a', 'b', 123, 'c', null, 'd'];
      const result = sanitizeArray(input, isString);
      expect(result).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should return default for non-arrays', () => {
      expect(sanitizeArray('not an array', isString, [])).toEqual([]);
      expect(sanitizeArray(null, isString, [])).toEqual([]);
      expect(sanitizeArray(undefined, isString, [])).toEqual([]);
    });
  });

  describe('detectDataIssues', () => {
    it('should detect NaN values', () => {
      const data = { foo: NaN, bar: 42 };
      const issues = detectDataIssues(data);
      expect(issues).toContain('NaN found at foo');
    });

    it('should detect Infinity values', () => {
      const data = { foo: Infinity, bar: -Infinity };
      const issues = detectDataIssues(data);
      expect(issues).toContain('Infinity found at foo');
      expect(issues).toContain('Infinity found at bar');
    });

    it('should detect invalid dates', () => {
      const data = { date: new Date('invalid') };
      const issues = detectDataIssues(data);
      expect(issues).toContain('Invalid Date at date');
    });

    it('should detect issues in nested objects', () => {
      const data = {
        level1: {
          level2: {
            value: NaN,
          },
        },
      };
      const issues = detectDataIssues(data);
      expect(issues).toContain('NaN found at level1.level2.value');
    });

    it('should detect issues in arrays', () => {
      const data = { arr: [1, NaN, 3] };
      const issues = detectDataIssues(data);
      expect(issues).toContain('NaN found at arr[1]');
    });
  });
});

describe('Word Progress Sanitization', () => {
  it('should sanitize valid word progress', () => {
    const input = {
      wordId: 'word_123',
      easeFactor: 2.5,
      interval: 10,
      repetitions: 3,
      maxRepetitions: 5,
      timesReviewed: 10,
      timesCorrect: 8,
      lastQuality: 4,
      nextReview: new Date('2024-01-01'),
      lastReview: new Date('2023-12-31'),
    };

    const result = sanitizeWordProgress(input);
    expect(result).toMatchObject(input);
  });

  it('should fix corrupted values', () => {
    const input = {
      wordId: 'word_123',
      easeFactor: NaN,
      interval: -5,
      repetitions: -1,
      timesReviewed: 10,
      timesCorrect: 20, // More than timesReviewed!
      lastQuality: 10, // Above max!
      nextReview: 'invalid',
      lastReview: null,
    };

    const result = sanitizeWordProgress(input as any);
    expect(result.easeFactor).toBe(2.5); // Default
    expect(result.interval).toBe(0); // Clamped to min
    expect(result.repetitions).toBe(0); // Clamped to min
    expect(result.timesCorrect).toBeLessThanOrEqual(result.timesReviewed);
    expect(result.lastQuality).toBeLessThanOrEqual(5);
    expect(result.nextReview).toBeInstanceOf(Date);
  });

  it('should handle missing fields', () => {
    const input = { wordId: 'word_123' };
    const result = sanitizeWordProgress(input as any);

    expect(result.wordId).toBe('word_123');
    expect(result.easeFactor).toBe(2.5);
    expect(result.interval).toBe(0);
    expect(result.repetitions).toBe(0);
    expect(result.timesReviewed).toBe(0);
  });
});

describe('User Stats Sanitization', () => {
  it('should sanitize valid stats', () => {
    const input = {
      xp: 1000,
      level: 10,
      streak: 5,
      longestStreak: 15,
      wordsLearned: 100,
      wordsInProgress: 50,
      totalReviews: 500,
      correctReviews: 450,
      achievements: ['first_word', 'level_10'],
      lastStudyDate: new Date('2024-01-01'),
    };

    const result = sanitizeUserStats(input);
    expect(result).toMatchObject(input);
  });

  it('should fix corrupted values', () => {
    const input = {
      xp: NaN,
      level: -1,
      streak: Infinity,
      longestStreak: 2, // Less than streak!
      wordsLearned: -10,
      wordsInProgress: -5,
      totalReviews: 100,
      correctReviews: 200, // More than total!
      achievements: 'not an array',
      lastStudyDate: 'invalid',
    };

    const result = sanitizeUserStats(input as any);
    expect(result.xp).toBe(0);
    expect(result.level).toBe(1); // Min level
    expect(result.streak).toBe(0);
    expect(result.longestStreak).toBeGreaterThanOrEqual(result.streak);
    expect(result.wordsLearned).toBe(0);
    expect(result.correctReviews).toBeLessThanOrEqual(result.totalReviews);
    expect(Array.isArray(result.achievements)).toBe(true);
  });
});

describe('Progress Collection Sanitization', () => {
  it('should sanitize all entries', () => {
    const input = {
      word_1: {
        wordId: 'word_1',
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        timesReviewed: 0,
        timesCorrect: 0,
        lastQuality: 0,
        nextReview: new Date(),
        lastReview: null,
      },
      word_2: {
        wordId: 'word_2',
        easeFactor: NaN, // Corrupted!
        interval: 5,
        repetitions: 2,
        timesReviewed: 10,
        timesCorrect: 8,
        lastQuality: 4,
        nextReview: new Date(),
        lastReview: new Date(),
      },
    };

    const result = sanitizeProgress(input as any);
    expect(result.word_1.easeFactor).toBe(2.5);
    expect(result.word_2.easeFactor).toBe(2.5); // Fixed!
  });

  it('should skip invalid entries', () => {
    const input = {
      word_1: { wordId: 'word_1', easeFactor: 2.5 },
      '': { wordId: '', easeFactor: 2.5 }, // Invalid key!
      word_2: { wordId: 'word_2', easeFactor: 3.0 },
    };

    const result = sanitizeProgress(input as any);
    expect(result['']).toBeUndefined();
    expect(result.word_1).toBeDefined();
    expect(result.word_2).toBeDefined();
  });
});

describe('User Store State Validation', () => {
  it('should validate correct state', () => {
    const state = {
      state: {
        stats: {
          xp: 100,
          level: 5,
          streak: 3,
          longestStreak: 10,
          wordsLearned: 50,
          wordsInProgress: 20,
          totalReviews: 200,
          correctReviews: 180,
          achievements: [],
          lastStudyDate: null,
        },
        progress: {},
      },
    };

    const result = validateUserStoreState(state);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing stats', () => {
    const state = { state: { progress: {} } };
    const result = validateUserStoreState(state);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid or missing stats object');
  });

  it('should detect missing progress', () => {
    const state = {
      state: {
        stats: {
          xp: 100,
          level: 5,
          streak: 3,
          longestStreak: 10,
          wordsLearned: 50,
          wordsInProgress: 20,
          totalReviews: 200,
          correctReviews: 180,
          achievements: [],
          lastStudyDate: null,
        },
      },
    };
    const result = validateUserStoreState(state);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid or missing progress object');
  });

  it('should warn about invalid progress entries', () => {
    const state = {
      state: {
        stats: {
          xp: 100,
          level: 5,
          streak: 3,
          longestStreak: 10,
          wordsLearned: 50,
          wordsInProgress: 20,
          totalReviews: 200,
          correctReviews: 180,
          achievements: [],
          lastStudyDate: null,
        },
        progress: {
          word_1: { invalid: 'data' },
        },
      },
    };
    const result = validateUserStoreState(state);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('Deep Sanitize', () => {
  it('should sanitize nested structures', () => {
    const input = {
      number: NaN,
      infinity: Infinity,
      date: new Date('invalid'),
      nested: {
        value: NaN,
        array: [1, NaN, 3],
      },
    };

    const result = deepSanitize(input);
    expect(result.number).toBe(0);
    expect(result.infinity).toBe(0);
    expect(result.date).toBeInstanceOf(Date);
    expect(result.nested.value).toBe(0);
    expect(result.nested.array).toEqual([1, 0, 3]);
  });

  it('should preserve valid values', () => {
    const input = {
      string: 'hello',
      number: 42,
      boolean: true,
      date: new Date('2024-01-01'),
      array: [1, 2, 3],
      nested: { value: 'test' },
    };

    const result = deepSanitize(input);
    expect(result.string).toBe('hello');
    expect(result.number).toBe(42);
    expect(result.boolean).toBe(true);
    expect(result.array).toEqual([1, 2, 3]);
  });
});
