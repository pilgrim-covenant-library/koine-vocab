/**
 * Tests for Data Migration System
 *
 * Tests version migrations, backward compatibility,
 * and data structure upgrades.
 */

import {
  CURRENT_SCHEMA_VERSION,
  migrateUserStore,
  migrateSessionStore,
  migrateHomeworkStore,
  backupBeforeMigration,
  cleanupOldBackups,
} from '@/lib/migration';

describe('Migration System', () => {
  describe('migrateUserStore', () => {
    it('should handle fresh v0 data', () => {
      const v0Data = {
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

      const { data, result } = migrateUserStore(v0Data);

      expect(result.success).toBe(true);
      expect(result.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(result.migrationsApplied.length).toBeGreaterThan(0);
      expect(data.migrationVersion).toBe(CURRENT_SCHEMA_VERSION);

      // V0→V1 adds cloud sync tracking
      expect(data.state.syncStatus).toBeDefined();
      expect(data.state.lastCloudSync).toBeDefined();

      // V1→V2 adds session persistence
      expect(data.state.sessionPersistence).toBeDefined();
    });

    it('should handle partial v1 data', () => {
      const v1Data = {
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
            lastStudyDate: null,
          },
          progress: {},
          syncStatus: 'never_synced',
          lastCloudSync: null,
        },
        migrationVersion: 1,
      };

      const { data, result } = migrateUserStore(v1Data);

      expect(result.success).toBe(true);
      expect(result.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(result.migrationsApplied).toContain('v1→v2: Added session persistence');

      // V1 fields should be preserved
      expect(data.state.syncStatus).toBe('never_synced');
      expect(data.state.lastCloudSync).toBe(null);

      // V1→V2 adds session persistence
      expect(data.state.sessionPersistence).toBeDefined();
    });

    it('should skip migration if already current version', () => {
      const currentData = {
        state: {
          stats: {
            xp: 300,
            level: 10,
            streak: 7,
            longestStreak: 20,
            wordsLearned: 150,
            wordsInProgress: 40,
            totalReviews: 600,
            correctReviews: 540,
            achievements: ['first_word', 'level_10'],
            lastStudyDate: null,
          },
          progress: {},
          syncStatus: 'synced',
          lastCloudSync: new Date().toISOString(),
          sessionPersistence: true,
        },
        migrationVersion: CURRENT_SCHEMA_VERSION,
      };

      const { data, result } = migrateUserStore(currentData);

      expect(result.success).toBe(true);
      expect(result.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(result.migrationsApplied).toHaveLength(0);
      expect(data).toEqual(currentData);
    });

    it('should handle corrupted data gracefully', () => {
      const corruptedData = {
        state: {
          stats: {
            xp: NaN,
            level: Infinity,
            streak: -1,
            longestStreak: -5,
            wordsLearned: 'not a number',
            wordsInProgress: null,
            totalReviews: undefined,
            correctReviews: {},
            achievements: 'not an array',
            lastStudyDate: 'invalid date',
          },
          progress: 'not an object',
        },
      };

      const { data, result } = migrateUserStore(corruptedData);

      // Migration should still succeed but with warnings
      expect(result.success).toBe(true);
      expect(data.migrationVersion).toBe(CURRENT_SCHEMA_VERSION);
    });

    it('should preserve user data during migration', () => {
      const originalData = {
        state: {
          stats: {
            xp: 500,
            level: 12,
            streak: 10,
            longestStreak: 25,
            wordsLearned: 200,
            wordsInProgress: 50,
            totalReviews: 1000,
            correctReviews: 900,
            achievements: ['first_word', 'level_10', 'streak_10'],
            lastStudyDate: '2024-01-15',
          },
          progress: {
            word_1: {
              wordId: 'word_1',
              easeFactor: 2.5,
              interval: 10,
              repetitions: 5,
              maxRepetitions: 5,
              timesReviewed: 20,
              timesCorrect: 18,
              lastQuality: 4,
              nextReview: new Date('2024-02-01'),
              lastReview: new Date('2024-01-20'),
            },
          },
          dailyGoal: 30,
          sessionLength: 25,
        },
      };

      const { data, result } = migrateUserStore(originalData);

      expect(result.success).toBe(true);

      // Critical data preserved
      expect(data.state.stats.xp).toBe(500);
      expect(data.state.stats.level).toBe(12);
      expect(data.state.stats.achievements).toContain('streak_10');
      expect(data.state.progress.word_1).toBeDefined();
      expect(data.state.progress.word_1.timesReviewed).toBe(20);
      expect(data.state.dailyGoal).toBe(30);
      expect(data.state.sessionLength).toBe(25);
    });
  });

  describe('migrateSessionStore', () => {
    it('should migrate v0 session data', () => {
      const v0Session = {
        state: {
          isActive: true,
          mode: 'flashcards',
          sessionId: 'session_123',
          words: [{ id: 'word_1', word: 'λόγος' }],
          currentIndex: 0,
          reviews: [],
        },
      };

      const { data, result } = migrateSessionStore(v0Session);

      expect(result.success).toBe(true);
      expect(data.migrationVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(data.state.isActive).toBe(true);
      expect(data.state.words).toHaveLength(1);
    });

    it('should handle empty session', () => {
      const emptySession = {
        state: {
          isActive: false,
          mode: null,
          sessionId: null,
          words: [],
          currentIndex: 0,
          reviews: [],
        },
      };

      const { data, result } = migrateSessionStore(emptySession);

      expect(result.success).toBe(true);
      expect(data.state.isActive).toBe(false);
      expect(data.state.words).toHaveLength(0);
    });

    it('should preserve session progress', () => {
      const activeSession = {
        state: {
          isActive: true,
          mode: 'quiz',
          sessionId: 'session_456',
          words: [
            { id: 'word_1', word: 'λόγος' },
            { id: 'word_2', word: 'θεός' },
            { id: 'word_3', word: 'ἀγάπη' },
          ],
          currentIndex: 1,
          reviews: [
            { wordId: 'word_1', quality: 4, timestamp: new Date() },
          ],
          xpEarned: 10,
          currentStreak: 1,
          bestStreak: 1,
        },
      };

      const { data, result } = migrateSessionStore(activeSession);

      expect(result.success).toBe(true);
      expect(data.state.currentIndex).toBe(1);
      expect(data.state.reviews).toHaveLength(1);
      expect(data.state.xpEarned).toBe(10);
      expect(data.state.currentStreak).toBe(1);
    });
  });

  describe('migrateHomeworkStore', () => {
    it('should migrate v0 homework data', () => {
      const v0Homework = {
        state: {
          homework1: {
            sections: {
              section1: {
                answers: ['answer1', 'answer2'],
                completed: false,
              },
            },
          },
        },
      };

      const { data, result } = migrateHomeworkStore(v0Homework);

      expect(result.success).toBe(true);
      expect(data.migrationVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(data.state.homework1.sections.section1.answers).toHaveLength(2);
    });

    it('should handle empty homework', () => {
      const emptyHomework = {
        state: {
          homework1: {
            sections: {},
          },
        },
      };

      const { data, result } = migrateHomeworkStore(emptyHomework);

      expect(result.success).toBe(true);
      expect(Object.keys(data.state.homework1.sections)).toHaveLength(0);
    });

    it('should preserve homework answers', () => {
      const homeworkWithAnswers = {
        state: {
          homework1: {
            sections: {
              section1: {
                answers: ['answer1', 'answer2', 'answer3'],
                completed: true,
                score: 2,
                timestamp: new Date().toISOString(),
              },
              section2: {
                answers: ['answer4'],
                completed: false,
              },
            },
          },
        },
      };

      const { data, result } = migrateHomeworkStore(homeworkWithAnswers);

      expect(result.success).toBe(true);
      expect(data.state.homework1.sections.section1.answers).toHaveLength(3);
      expect(data.state.homework1.sections.section1.completed).toBe(true);
      expect(data.state.homework1.sections.section1.score).toBe(2);
      expect(data.state.homework1.sections.section2.answers).toHaveLength(1);
      expect(data.state.homework1.sections.section2.completed).toBe(false);
    });
  });

  describe('backupBeforeMigration', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should create backup before migration', () => {
      const storeName = 'test-store';
      const data = {
        state: { foo: 'bar' },
        version: 1,
      };

      backupBeforeMigration(storeName, data);

      // Check that backup was created
      const keys = Object.keys(localStorage);
      const backupKey = keys.find((k) => k.startsWith(`${storeName}_backup_`));

      expect(backupKey).toBeDefined();

      if (backupKey) {
        const backup = JSON.parse(localStorage.getItem(backupKey)!);
        expect(backup.data.state.foo).toBe('bar');
        expect(backup.version).toBe(1);
      }
    });

    it('should limit number of backups', () => {
      const storeName = 'test-store';

      // Create 15 backups (more than max of 10)
      for (let i = 0; i < 15; i++) {
        backupBeforeMigration(storeName, { version: i });
      }

      const keys = Object.keys(localStorage);
      const backupKeys = keys.filter((k) => k.startsWith(`${storeName}_backup_`));

      // Should only keep 10 most recent
      expect(backupKeys.length).toBeLessThanOrEqual(10);
    });

    it('should handle backup errors gracefully', () => {
      const storeName = 'test-store';
      const hugeData = {
        state: {
          // Create data too large for localStorage
          huge: 'x'.repeat(10 * 1024 * 1024), // 10MB
        },
      };

      // Should not throw
      expect(() => {
        backupBeforeMigration(storeName, hugeData);
      }).not.toThrow();
    });
  });

  describe('cleanupOldBackups', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should remove old backups beyond retention period', () => {
      const storeName = 'test-store';

      // Create backups with different timestamps
      const now = Date.now();
      const oldBackupKey = `${storeName}_backup_${now - 31 * 24 * 60 * 60 * 1000}`; // 31 days old
      const recentBackupKey = `${storeName}_backup_${now - 5 * 24 * 60 * 60 * 1000}`; // 5 days old

      localStorage.setItem(oldBackupKey, JSON.stringify({ version: 0 }));
      localStorage.setItem(recentBackupKey, JSON.stringify({ version: 1 }));

      cleanupOldBackups(storeName, 30); // 30 day retention

      expect(localStorage.getItem(oldBackupKey)).toBeNull();
      expect(localStorage.getItem(recentBackupKey)).not.toBeNull();
    });

    it('should keep all backups within retention period', () => {
      const storeName = 'test-store';

      // Create 5 recent backups
      const now = Date.now();
      for (let i = 0; i < 5; i++) {
        const key = `${storeName}_backup_${now - i * 24 * 60 * 60 * 1000}`;
        localStorage.setItem(key, JSON.stringify({ version: i }));
      }

      cleanupOldBackups(storeName, 30);

      const keys = Object.keys(localStorage);
      const backupKeys = keys.filter((k) => k.startsWith(`${storeName}_backup_`));

      expect(backupKeys.length).toBe(5);
    });

    it('should handle cleanup errors gracefully', () => {
      // Should not throw even with no backups
      expect(() => {
        cleanupOldBackups('nonexistent-store', 30);
      }).not.toThrow();
    });
  });

  describe('Version Compatibility', () => {
    it('should maintain backward compatibility across all versions', () => {
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

      // Migrate from v0 to current
      const { data: finalData, result } = migrateUserStore(v0Data);

      expect(result.success).toBe(true);

      // All original data should be preserved
      expect(finalData.state.stats.xp).toBe(1000);
      expect(finalData.state.stats.level).toBe(20);
      expect(finalData.state.stats.wordsLearned).toBe(300);
      expect(finalData.state.progress.word_1.timesReviewed).toBe(50);
      expect(finalData.state.progress.word_1.easeFactor).toBe(2.5);

      // New fields should be added
      expect(finalData.migrationVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(finalData.state.syncStatus).toBeDefined();
      expect(finalData.state.lastCloudSync).toBeDefined();
      expect(finalData.state.sessionPersistence).toBeDefined();
    });

    it('should handle multi-step migrations correctly', () => {
      const v0Data = {
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

      const { data, result } = migrateUserStore(v0Data);

      expect(result.success).toBe(true);
      expect(result.version).toBe(CURRENT_SCHEMA_VERSION);

      // Should have applied all migrations
      if (CURRENT_SCHEMA_VERSION === 2) {
        expect(result.migrationsApplied).toHaveLength(2);
        expect(result.migrationsApplied).toContain('v0→v1: Added cloud sync tracking');
        expect(result.migrationsApplied).toContain('v1→v2: Added session persistence');
      }
    });
  });
});
