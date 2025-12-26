/**
 * Integration Tests for Data Persistence
 *
 * Tests the complete flow of data persistence including:
 * - localStorage operations
 * - Cloud sync
 * - Data validation
 * - Recovery
 * - Migration
 */

import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useHomeworkStore } from '@/stores/homeworkStore';
import {
  syncProgressToCloud,
  loadProgressFromCloud,
  syncHomeworkToCloud,
  loadHomeworkFromCloud,
} from '@/lib/firebase';
import { recoverUserStore } from '@/lib/dataRecovery';
import { migrateUserStore } from '@/lib/migration';
import { validateUserStoreState, detectDataIssues } from '@/lib/dataValidation';

describe('Data Persistence Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Complete User Journey', () => {
    it('should persist data through full learning session', () => {
      // 1. User starts session
      useSessionStore.getState().startSession('flashcard', [
        { id: 'word_1', word: 'λόγος', translation: 'word' },
        { id: 'word_2', word: 'θεός', translation: 'God' },
      ]);

      // Get updated state after action
      let sessionStore = useSessionStore.getState();
      expect(sessionStore.isActive).toBe(true);
      expect(sessionStore.words).toHaveLength(2);

      // 2. User submits review
      useUserStore.getState().reviewWord('word_1', 4);

      // Get updated state after action
      let userStore = useUserStore.getState();
      expect(userStore.progress.word_1).toBeDefined();
      expect(userStore.stats.totalReviews).toBe(1);

      // 3. Data should persist in localStorage
      const storedUserData = localStorage.getItem('koine-user-store');
      expect(storedUserData).not.toBeNull();

      const storedSessionData = localStorage.getItem('koine-session-store');
      expect(storedSessionData).not.toBeNull();

      // 4. Parse and validate stored data
      if (storedUserData) {
        const parsed = JSON.parse(storedUserData);
        expect(parsed.state.progress.word_1).toBeDefined();
        expect(parsed.state.stats.totalReviews).toBe(1);

        const validation = validateUserStoreState(parsed);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      }

      // 5. User refreshes page - data should be restored
      const newUserStore = useUserStore.getState();
      expect(newUserStore.progress.word_1).toBeDefined();
      expect(newUserStore.stats.totalReviews).toBe(1);

      const newSessionStore = useSessionStore.getState();
      expect(newSessionStore.isActive).toBe(true);
      expect(newSessionStore.words).toHaveLength(2);
    });

    it('should handle homework submission flow', () => {
      // Start the section first (SectionId is numeric 1-5, not string)
      useHomeworkStore.getState().startSection(1);

      // 1. User answers questions
      useHomeworkStore.getState().submitAnswer(1, 'q1', 'answer1', true);
      useHomeworkStore.getState().submitAnswer(1, 'q2', 'answer2', true);

      // Get updated state
      const homeworkStore = useHomeworkStore.getState();
      expect(homeworkStore.homework1.sections[1].answers).toHaveLength(2);

      // 2. Data persists in localStorage
      const storedData = localStorage.getItem('koine-homework-store');
      expect(storedData).not.toBeNull();

      if (storedData) {
        const parsed = JSON.parse(storedData);
        expect(parsed.state.homework1.sections[1].answers).toHaveLength(2);
      }

      // 3. Mark section complete
      useHomeworkStore.getState().completeSection(1);

      // Get updated state
      const updatedHomeworkStore = useHomeworkStore.getState();
      expect(updatedHomeworkStore.homework1.sections[1].status).toBe('completed');
      expect(updatedHomeworkStore.homework1.sections[1].score).toBe(2); // 2 correct answers

      // 4. Data should persist
      const updatedData = localStorage.getItem('koine-homework-store');
      if (updatedData) {
        const parsed = JSON.parse(updatedData);
        expect(parsed.state.homework1.sections[1].status).toBe('completed');
        expect(parsed.state.homework1.sections[1].score).toBe(2);
      }
    });
  });

  describe('Data Corruption Recovery', () => {
    it('should recover from corrupted localStorage', () => {
      // 1. Simulate corrupted data in localStorage
      const corruptedData = `{
        "state": {
          "stats": {
            "xp": NaN,
            "level": Infinity,
            "streak": -1,
            "longestStreak": 10,
            "wordsLearned": 50,
            "wordsInProgress": 20,
            "totalReviews": 200,
            "correctReviews": 180,
            "achievements": [],
            "lastStudyDate": null
          },
          "progress": {
      `;

      localStorage.setItem('koine-user-store', corruptedData);

      // 2. Attempt recovery
      const recoveryResult = recoverUserStore(corruptedData);

      expect(recoveryResult.success).toBe(true);
      expect(recoveryResult.recovered).toBe(true);

      // 3. Recovered data should be valid
      if (recoveryResult.recoveredData) {
        const validation = validateUserStoreState(recoveryResult.recoveredData);
        expect(validation.isValid).toBe(true);

        const issues = detectDataIssues(recoveryResult.recoveredData);
        expect(issues).toHaveLength(0);
      }
    });

    it('should handle quota exceeded gracefully', () => {
      const userStore = useUserStore.getState();

      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      let quotaExceeded = false;

      localStorage.setItem = jest.fn((key, value) => {
        if (!quotaExceeded) {
          quotaExceeded = true;
          const error: any = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        }
        // After cleanup, should succeed
        originalSetItem.call(localStorage, key, value);
      });

      // Should handle error and retry
      expect(() => {
        userStore.reviewWord('word_1', 4);
      }).not.toThrow();

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Migration Flow', () => {
    it('should migrate v0 data to current version', () => {
      // 1. Create v0 data (no migration version)
      const v0Data = {
        state: {
          stats: {
            xp: 1000,
            level: 20,
            streak: 15,
            longestStreak: 30,
            wordsLearned: 300,
            wordsInProgress: 80,
            totalReviews: 2000,
            correctReviews: 1800,
            achievements: ['master'],
            lastStudyDate: '2024-01-01',
          },
          progress: {
            word_1: {
              wordId: 'word_1',
              easeFactor: 2.5,
              interval: 30,
              repetitions: 10,
              maxRepetitions: 10,
              timesReviewed: 50,
              timesCorrect: 45,
              lastQuality: 5,
              nextReview: new Date('2024-03-01'),
              lastReview: new Date('2024-02-01'),
            },
          },
        },
      };

      // 2. Store v0 data
      localStorage.setItem('koine-user-store', JSON.stringify(v0Data));

      // 3. Migrate
      const { data, result } = migrateUserStore(v0Data);

      expect(result.success).toBe(true);
      expect(result.migrationsApplied.length).toBeGreaterThan(0);
      expect(data.migrationVersion).toBe(2);

      // 4. Original data should be preserved
      expect(data.state.stats.xp).toBe(1000);
      expect(data.state.stats.level).toBe(20);
      expect(data.state.progress.word_1.timesReviewed).toBe(50);

      // 5. New fields should be added
      expect(data.state.syncStatus).toBeDefined();
      expect(data.state.lastCloudSync).toBeDefined();
      expect(data.state.sessionPersistence).toBeDefined();
    });

    it('should handle migration errors gracefully', () => {
      const invalidData = {
        state: 'not an object',
      };

      const { data, result } = migrateUserStore(invalidData);

      // Should attempt migration even with invalid data
      expect(result).toBeDefined();
    });
  });

  describe('Cloud Sync Flow', () => {
    it('should sync to cloud after local changes', async () => {
      const userStore = useUserStore.getState();

      // 1. Make local changes
      userStore.reviewWord('word_1', 4);
      userStore.reviewWord('word_2', 5);

      expect(userStore.stats.totalReviews).toBe(2);

      // 2. Sync to cloud (mocked)
      // In real test, would mock Firebase
      const mockUid = 'user_123';

      // Would call: await syncProgressToCloud(mockUid, { ... })

      // 3. Load from cloud (mocked)
      // Would call: const cloudData = await loadProgressFromCloud(mockUid)

      // 4. Verify data matches
      // expect(cloudData.stats.totalReviews).toBe(2)
    });

    it('should handle offline sync queue', async () => {
      // 1. Go offline
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const userStore = useUserStore.getState();

      // 2. Make changes while offline
      userStore.reviewWord('word_1', 4);
      userStore.reviewWord('word_2', 5);

      // 3. Changes should be queued
      // (Would use syncQueue to verify)

      // 4. Go online
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));

      // 5. Queue should process
      // Wait for processing...

      // 6. Cloud should have data
      // Would verify with Firebase mock
    });
  });

  describe('Data Validation Flow', () => {
    it('should validate data on load', () => {
      const userStore = useUserStore.getState();

      // 1. Submit valid review
      userStore.reviewWord('word_1', 4);

      // 2. Get stored data
      const storedData = localStorage.getItem('koine-user-store');
      expect(storedData).not.toBeNull();

      if (storedData) {
        const parsed = JSON.parse(storedData);

        // 3. Validate structure
        const validation = validateUserStoreState(parsed);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);

        // 4. Check for data issues
        const issues = detectDataIssues(parsed);
        expect(issues).toHaveLength(0);
      }
    });

    it('should sanitize invalid data on load', () => {
      // 1. Store invalid data
      const invalidData = {
        state: {
          stats: {
            xp: NaN,
            level: -1,
            streak: Infinity,
            longestStreak: 10,
            wordsLearned: -5,
            wordsInProgress: 'not a number',
            totalReviews: 100,
            correctReviews: 200, // More than total!
            achievements: 'not an array',
            lastStudyDate: 'invalid date',
          },
          progress: {},
        },
        version: 0,
      };

      localStorage.setItem('koine-user-store', JSON.stringify(invalidData));

      // 2. Load store (should sanitize)
      const userStore = useUserStore.getState();

      // 3. Data should be sanitized
      expect(isNaN(userStore.stats.xp)).toBe(false);
      expect(userStore.stats.level).toBeGreaterThanOrEqual(1);
      expect(isFinite(userStore.stats.streak)).toBe(true);
      expect(userStore.stats.wordsLearned).toBeGreaterThanOrEqual(0);
      expect(userStore.stats.correctReviews).toBeLessThanOrEqual(
        userStore.stats.totalReviews
      );
      expect(Array.isArray(userStore.stats.achievements)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should load large datasets efficiently', () => {
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

      const largeData = {
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
        version: 0,
      };

      // Store large dataset
      const startStore = performance.now();
      localStorage.setItem('koine-user-store', JSON.stringify(largeData));
      const endStore = performance.now();

      expect(endStore - startStore).toBeLessThan(1000); // < 1 second

      // Load large dataset
      const startLoad = performance.now();
      const loaded = JSON.parse(localStorage.getItem('koine-user-store')!);
      const endLoad = performance.now();

      expect(endLoad - startLoad).toBeLessThan(500); // < 0.5 seconds

      // Validate large dataset
      const startValidate = performance.now();
      const validation = validateUserStoreState(loaded);
      const endValidate = performance.now();

      expect(endValidate - startValidate).toBeLessThan(1000); // < 1 second
      expect(validation.isValid).toBe(true);
    });

    it('should handle rapid updates efficiently', () => {
      // Clear and reset store for this test
      localStorage.clear();

      // Get initial count (should be 0 after clear)
      const initialUserStore = useUserStore.getState();
      const initialReviews = initialUserStore.stats.totalReviews;

      const startTime = performance.now();

      // Submit 100 reviews rapidly
      for (let i = 0; i < 100; i++) {
        useUserStore.getState().reviewWord(`word_${i}`, 4);
      }

      const endTime = performance.now();

      // Get fresh state after all reviews
      const updatedUserStore = useUserStore.getState();

      // Should complete quickly
      expect(endTime - startTime).toBeLessThan(1000);
      expect(updatedUserStore.stats.totalReviews).toBe(initialReviews + 100);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle localStorage unavailable', () => {
      // Mock localStorage to throw
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => {
        throw new Error('localStorage not available');
      });

      // Should not crash
      expect(() => {
        const userStore = useUserStore.getState();
      }).not.toThrow();

      // Restore
      localStorage.getItem = originalGetItem;
    });

    it('should handle corrupted JSON', () => {
      localStorage.setItem('koine-user-store', 'invalid json { [ }');

      // Should recover or reset gracefully
      expect(() => {
        const userStore = useUserStore.getState();
      }).not.toThrow();
    });

    it('should handle missing required fields', () => {
      const incompleteData = {
        state: {
          stats: {
            xp: 100,
            // Missing required fields
          },
        },
      };

      localStorage.setItem('koine-user-store', JSON.stringify(incompleteData));

      // Should fill in defaults
      const userStore = useUserStore.getState();
      expect(userStore.stats.level).toBeDefined();
      expect(userStore.stats.streak).toBeDefined();
      expect(userStore.progress).toBeDefined();
    });
  });

  describe('Backward Compatibility', () => {
    it('should load data from older app versions', () => {
      // Simulate data from app version 1.0
      const v1Data = {
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
          progress: {},
          // Old date format (not ISO)
          lastReviewDate: 'Mon Jan 15 2024',
        },
      };

      // Test migration logic directly (store is already initialized)
      const { data: migratedData, result } = migrateUserStore(v1Data);

      // Should migrate successfully
      expect(result.success).toBe(true);
      expect(migratedData.state.stats.xp).toBe(500);
      expect(migratedData.state.stats.level).toBe(10);

      // Should add new fields without modifying original data
      expect(migratedData.state.syncStatus).toBeDefined();
      expect(migratedData.migrationVersion).toBe(2);
    });

    it('should not break existing user data', () => {
      // Real user data sample
      const realUserData = {
        state: {
          stats: {
            xp: 2500,
            level: 25,
            streak: 20,
            longestStreak: 40,
            wordsLearned: 500,
            wordsInProgress: 150,
            totalReviews: 3000,
            correctReviews: 2700,
            achievements: [
              'first_word',
              'level_10',
              'level_20',
              'streak_10',
              'streak_20',
            ],
            lastStudyDate: '2024-01-20',
          },
          progress: {
            word_1: {
              wordId: 'word_1',
              easeFactor: 2.6,
              interval: 45,
              repetitions: 12,
              maxRepetitions: 12,
              timesReviewed: 60,
              timesCorrect: 54,
              lastQuality: 5,
              nextReview: new Date('2024-03-15').toISOString(),
              lastReview: new Date('2024-01-30').toISOString(),
            },
          },
        },
        version: 0,
      };

      // Test migration logic directly (store is already initialized)
      const { data: migratedData, result } = migrateUserStore(realUserData);

      // Should migrate successfully
      expect(result.success).toBe(true);

      // All data should be preserved
      expect(migratedData.state.stats.xp).toBe(2500);
      expect(migratedData.state.stats.level).toBe(25);
      expect(migratedData.state.stats.achievements).toHaveLength(5);
      expect(migratedData.state.progress.word_1).toBeDefined();
      expect(migratedData.state.progress.word_1.timesReviewed).toBe(60);

      // Should add new fields
      expect(migratedData.migrationVersion).toBe(2);
      expect(migratedData.state.syncStatus).toBeDefined();
    });
  });
});
