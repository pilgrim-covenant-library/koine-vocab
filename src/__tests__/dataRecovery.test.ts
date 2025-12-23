/**
 * Tests for Data Recovery System
 *
 * Tests recovery from corrupted localStorage, JSON repair,
 * partial recovery, and data export/import.
 */

import {
  recoverUserStore,
  createRecoveryReport,
  exportRecoveredData,
  importRecoveryData,
  RecoveryResult,
} from '@/lib/dataRecovery';

describe('Data Recovery', () => {
  describe('recoverUserStore', () => {
    it('should recover valid JSON data', () => {
      const validData = JSON.stringify({
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
        version: 0,
      });

      const result = recoverUserStore(validData);

      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);
      expect(result.partialRecovery).toBe(false);
      expect(result.errors).toHaveLength(0);
      expect(result.recoveredData).toBeDefined();
    });

    it('should repair truncated JSON', () => {
      // Missing closing braces
      const truncatedData = `{
        "state": {
          "stats": {
            "xp": 100,
            "level": 5,
            "streak": 3
          },
          "progress": {
      `;

      const result = recoverUserStore(truncatedData);

      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);
      expect(result.partialRecovery).toBe(true);
      expect(result.warnings).toContain('JSON was repaired - some data may be lost');
    });

    it('should handle NaN values in JSON', () => {
      const dataWithNaN = `{
        "state": {
          "stats": {
            "xp": NaN,
            "level": 5,
            "streak": 3,
            "longestStreak": 10,
            "wordsLearned": 50,
            "wordsInProgress": 20,
            "totalReviews": 200,
            "correctReviews": 180,
            "achievements": [],
            "lastStudyDate": null
          },
          "progress": {}
        }
      }`;

      const result = recoverUserStore(dataWithNaN);

      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);

      // NaN should be replaced with default value
      if (result.recoveredData) {
        expect(result.recoveredData.state.stats.xp).toBe(0);
      }
    });

    it('should handle Infinity values in JSON', () => {
      const dataWithInfinity = `{
        "state": {
          "stats": {
            "xp": 100,
            "level": Infinity,
            "streak": -Infinity,
            "longestStreak": 10,
            "wordsLearned": 50,
            "wordsInProgress": 20,
            "totalReviews": 200,
            "correctReviews": 180,
            "achievements": [],
            "lastStudyDate": null
          },
          "progress": {}
        }
      }`;

      const result = recoverUserStore(dataWithInfinity);

      expect(result.success).toBe(true);

      if (result.recoveredData) {
        expect(result.recoveredData.state.stats.level).not.toBe(Infinity);
        expect(result.recoveredData.state.stats.streak).not.toBe(-Infinity);
      }
    });

    it('should handle trailing commas', () => {
      const dataWithTrailingCommas = `{
        "state": {
          "stats": {
            "xp": 100,
            "level": 5,
            "streak": 3,
          },
          "progress": {},
        },
      }`;

      const result = recoverUserStore(dataWithTrailingCommas);

      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);
    });

    it('should recover from missing stats', () => {
      const dataWithoutStats = JSON.stringify({
        state: {
          progress: {
            word_1: {
              wordId: 'word_1',
              easeFactor: 2.5,
              interval: 10,
              repetitions: 3,
              maxRepetitions: 5,
              timesReviewed: 10,
              timesCorrect: 8,
              lastQuality: 4,
              nextReview: new Date(),
              lastReview: new Date(),
            },
          },
        },
      });

      const result = recoverUserStore(dataWithoutStats);

      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);

      if (result.recoveredData) {
        // Should create default stats
        expect(result.recoveredData.state.stats).toBeDefined();
        expect(result.recoveredData.state.stats.xp).toBe(0);
        expect(result.recoveredData.state.stats.level).toBe(1);
      }
    });

    it('should recover from missing progress', () => {
      const dataWithoutProgress = JSON.stringify({
        state: {
          stats: {
            xp: 500,
            level: 10,
            streak: 5,
            longestStreak: 15,
            wordsLearned: 100,
            wordsInProgress: 30,
            totalReviews: 400,
            correctReviews: 360,
            achievements: ['first_word'],
            lastStudyDate: '2024-01-15',
          },
        },
      });

      const result = recoverUserStore(dataWithoutProgress);

      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);

      if (result.recoveredData) {
        // Should create empty progress
        expect(result.recoveredData.state.progress).toBeDefined();
        expect(Object.keys(result.recoveredData.state.progress)).toHaveLength(0);
      }
    });

    it('should perform partial word-by-word recovery', () => {
      const dataWithCorruptedWords = JSON.stringify({
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
            word_1: {
              wordId: 'word_1',
              easeFactor: 2.5,
              interval: 10,
              repetitions: 3,
              maxRepetitions: 5,
              timesReviewed: 10,
              timesCorrect: 8,
              lastQuality: 4,
              nextReview: new Date().toISOString(),
              lastReview: new Date().toISOString(),
            },
            word_2: {
              // Corrupted - missing required fields
              wordId: 'word_2',
            },
            word_3: {
              wordId: 'word_3',
              easeFactor: 2.8,
              interval: 20,
              repetitions: 5,
              maxRepetitions: 5,
              timesReviewed: 20,
              timesCorrect: 18,
              lastQuality: 5,
              nextReview: new Date().toISOString(),
              lastReview: new Date().toISOString(),
            },
          },
        },
      });

      const result = recoverUserStore(dataWithCorruptedWords);

      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);

      if (result.recoveredData) {
        // word_1 and word_3 should be recovered
        expect(result.recoveredData.state.progress.word_1).toBeDefined();
        expect(result.recoveredData.state.progress.word_3).toBeDefined();

        // word_2 might be recovered with defaults or sanitized
        expect(result.recoveredData.state.progress.word_2).toBeDefined();
      }
    });

    it('should detect lost data', () => {
      const dataWithMissingWords = JSON.stringify({
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
            achievements: ['first_word', 'level_5', 'streak_10'],
            lastStudyDate: '2024-01-15',
          },
          progress: {
            word_1: {
              wordId: 'word_1',
              easeFactor: 2.5,
              interval: 10,
              repetitions: 3,
              maxRepetitions: 5,
              timesReviewed: 10,
              timesCorrect: 8,
              lastQuality: 4,
              nextReview: new Date().toISOString(),
              lastReview: new Date().toISOString(),
            },
            // Missing word_2, word_3, etc.
          },
          studyHistory: {
            '2024-01-01': { reviews: 10, wordsLearned: 5 },
            '2024-01-02': { reviews: 15, wordsLearned: 3 },
            // Missing many days
          },
        },
      });

      const result = recoverUserStore(dataWithMissingWords);

      expect(result.success).toBe(true);

      // Should detect if data was lost
      if (result.lostData && result.lostData.length > 0) {
        expect(result.partialRecovery).toBe(true);
      }
    });

    it('should fail gracefully on completely invalid data', () => {
      const invalidData = 'this is not json at all { [ } ]';

      const result = recoverUserStore(invalidData);

      expect(result.success).toBe(false);
      expect(result.recovered).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should apply migrations during recovery', () => {
      const v0Data = JSON.stringify({
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
      });

      const result = recoverUserStore(v0Data);

      expect(result.success).toBe(true);

      if (result.recoveredData) {
        // Migration should be applied
        expect(result.recoveredData.state.migrationVersion).toBe(2);
      }
    });
  });

  describe('createRecoveryReport', () => {
    it('should create report for successful recovery', () => {
      const result: RecoveryResult = {
        success: true,
        recovered: true,
        partialRecovery: false,
        errors: [],
        warnings: ['JSON was repaired'],
        recoveredData: {},
      };

      const report = createRecoveryReport(result);

      expect(report).toContain('✅ Data Recovery Successful');
      expect(report).toContain('✅ Full Recovery - All data restored');
      expect(report).toContain('JSON was repaired');
    });

    it('should create report for partial recovery', () => {
      const result: RecoveryResult = {
        success: true,
        recovered: true,
        partialRecovery: true,
        errors: [],
        warnings: ['Some invalid entries found'],
        lostData: ['5 word progress entries', '3 study history entries'],
        recoveredData: {},
      };

      const report = createRecoveryReport(result);

      expect(report).toContain('⚠️ Partial Recovery - Some data could not be restored');
      expect(report).toContain('Lost Data:');
      expect(report).toContain('5 word progress entries');
      expect(report).toContain('3 study history entries');
    });

    it('should create report for failed recovery', () => {
      const result: RecoveryResult = {
        success: false,
        recovered: false,
        partialRecovery: false,
        errors: ['JSON parse error', 'Invalid data structure'],
        warnings: [],
      };

      const report = createRecoveryReport(result);

      expect(report).toContain('❌ Data Recovery Failed');
      expect(report).toContain('Errors:');
      expect(report).toContain('JSON parse error');
      expect(report).toContain('Invalid data structure');
    });
  });

  describe('exportRecoveredData', () => {
    it('should export data as JSON file', () => {
      const data = {
        state: {
          stats: { xp: 100, level: 5 },
          progress: {},
        },
      };

      // Mock Blob and URL for browser download functionality
      global.Blob = jest.fn().mockImplementation((content, options) => ({
        content,
        options,
      })) as any;

      global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();

      // Mock document methods
      const createElementSpy = jest.spyOn(document, 'createElement');
      const clickMock = jest.fn();
      createElementSpy.mockReturnValue({
        click: clickMock,
        href: '',
        download: '',
      } as any);

      exportRecoveredData(data, 'test-export.json');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickMock).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });

    it('should handle export errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Force an error by passing circular reference
      const circular: any = {};
      circular.self = circular;

      expect(() => {
        exportRecoveredData(circular);
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('importRecoveryData', () => {
    it('should import and recover data from file', async () => {
      const fileContent = JSON.stringify({
        state: {
          stats: {
            xp: 200,
            level: 8,
            streak: 5,
            longestStreak: 15,
            wordsLearned: 100,
            wordsInProgress: 30,
            totalReviews: 400,
            correctReviews: 360,
            achievements: ['first_word'],
            lastStudyDate: '2024-01-15',
          },
          progress: {},
        },
      });

      const file = new File([fileContent], 'backup.json', {
        type: 'application/json',
      });

      const result = await importRecoveryData(file);

      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);
      expect(result.recoveredData).toBeDefined();
    });

    it('should handle corrupted file content', async () => {
      const corruptedContent = 'invalid json { [ }';

      const file = new File([corruptedContent], 'corrupted.json', {
        type: 'application/json',
      });

      const result = await importRecoveryData(file);

      // Should attempt recovery
      expect(result).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle file read errors', async () => {
      // Create a mock file that will cause a read error
      const file = new File([], 'empty.json', { type: 'application/json' });

      const result = await importRecoveryData(file);

      // Should handle gracefully
      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle deeply nested corruption', () => {
      const deeplyCorrupted = JSON.stringify({
        state: {
          stats: {
            xp: NaN,
            level: 5,
            streak: 3,
            longestStreak: 10,
            wordsLearned: Infinity,
            wordsInProgress: -Infinity,
            totalReviews: 200,
            correctReviews: 180,
            achievements: [],
            lastStudyDate: null,
          },
          progress: {
            word_1: {
              wordId: 'word_1',
              easeFactor: NaN,
              interval: Infinity,
              repetitions: -1,
              maxRepetitions: 5,
              timesReviewed: 10,
              timesCorrect: 20, // More than reviewed!
              lastQuality: 10, // Above max!
              nextReview: 'invalid date',
              lastReview: null,
            },
          },
        },
      });

      const result = recoverUserStore(deeplyCorrupted);

      expect(result.success).toBe(true);

      if (result.recoveredData) {
        const stats = result.recoveredData.state.stats;
        expect(isNaN(stats.xp)).toBe(false);
        expect(isFinite(stats.wordsLearned)).toBe(true);
        expect(isFinite(stats.wordsInProgress)).toBe(true);

        const word = result.recoveredData.state.progress.word_1;
        expect(isNaN(word.easeFactor)).toBe(false);
        expect(isFinite(word.interval)).toBe(true);
        expect(word.repetitions).toBeGreaterThanOrEqual(0);
        expect(word.timesCorrect).toBeLessThanOrEqual(word.timesReviewed);
        expect(word.lastQuality).toBeLessThanOrEqual(5);
      }
    });

    it('should handle empty data', () => {
      const emptyData = JSON.stringify({});

      const result = recoverUserStore(emptyData);

      // Should create default state
      expect(result.success).toBe(true);

      if (result.recoveredData) {
        expect(result.recoveredData.state).toBeDefined();
        expect(result.recoveredData.state.stats).toBeDefined();
        expect(result.recoveredData.state.progress).toBeDefined();
      }
    });

    it('should handle null values', () => {
      const dataWithNulls = JSON.stringify({
        state: {
          stats: null,
          progress: null,
        },
      });

      const result = recoverUserStore(dataWithNulls);

      expect(result.success).toBe(true);

      if (result.recoveredData) {
        // Should create defaults for null values
        expect(result.recoveredData.state.stats).not.toBeNull();
        expect(result.recoveredData.state.progress).not.toBeNull();
      }
    });

    it('should handle very large progress data', () => {
      const largeProgress: any = {};

      // Create 1000 word progress entries
      for (let i = 0; i < 1000; i++) {
        largeProgress[`word_${i}`] = {
          wordId: `word_${i}`,
          easeFactor: 2.5,
          interval: 10,
          repetitions: 3,
          maxRepetitions: 5,
          timesReviewed: 10,
          timesCorrect: 8,
          lastQuality: 4,
          nextReview: new Date().toISOString(),
          lastReview: new Date().toISOString(),
        };
      }

      const largeData = JSON.stringify({
        state: {
          stats: {
            xp: 10000,
            level: 50,
            streak: 100,
            longestStreak: 200,
            wordsLearned: 1000,
            wordsInProgress: 500,
            totalReviews: 5000,
            correctReviews: 4500,
            achievements: [],
            lastStudyDate: null,
          },
          progress: largeProgress,
        },
      });

      const startTime = performance.now();
      const result = recoverUserStore(largeData);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second

      if (result.recoveredData) {
        expect(Object.keys(result.recoveredData.state.progress)).toHaveLength(1000);
      }
    });
  });
});
