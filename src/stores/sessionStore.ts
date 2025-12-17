import { create } from 'zustand';
import type { LearningMode, ReviewWord, VocabularyWord } from '@/types';
import { generateId } from '@/lib/utils';

interface SessionState {
  // Current session
  isActive: boolean;
  mode: LearningMode | null;
  sessionId: string | null;
  startTime: number | null;
  lastWordTime: number | null; // Tracks when current word started

  // Session data
  words: VocabularyWord[];
  currentIndex: number;
  reviews: ReviewWord[];
  xpEarned: number; // Total XP earned in this session

  // UI state
  isFlipped: boolean;
  showResult: boolean;
  selectedAnswer: number | null;
  typedAnswer: string;

  // Actions
  startSession: (mode: LearningMode, words: VocabularyWord[]) => void;
  endSession: () => SessionSummary;
  nextWord: () => void;
  previousWord: () => void;

  // Flashcard actions
  flipCard: () => void;
  rateCard: (quality: number) => void;

  // Quiz actions
  selectAnswer: (index: number) => void;
  submitQuizAnswer: (correct: boolean) => void;

  // Typing actions
  setTypedAnswer: (answer: string) => void;
  submitTypedAnswer: (correct: boolean) => void;

  // XP tracking
  recordXP: (amount: number) => void;
  decrementXP: (amount: number) => void;

  // Undo support
  undoLastReview: () => boolean;

  // Streak tracking
  currentStreak: number;
  bestStreak: number;

  // Getters
  getCurrentWord: () => VocabularyWord | null;
  getProgress: () => { current: number; total: number; percentage: number };
  getSessionStats: () => { correct: number; total: number; accuracy: number; currentStreak: number; bestStreak: number };
}

export interface SessionSummary {
  mode: LearningMode;
  duration: number; // ms
  wordsReviewed: number;
  correctCount: number;
  accuracy: number;
  xpEarned: number;
  isPerfect: boolean;
  reviews: ReviewWord[];
}

export const useSessionStore = create<SessionState>((set, get) => ({
  isActive: false,
  mode: null,
  sessionId: null,
  startTime: null,
  lastWordTime: null,
  words: [],
  currentIndex: 0,
  reviews: [],
  xpEarned: 0,
  isFlipped: false,
  showResult: false,
  selectedAnswer: null,
  typedAnswer: '',
  currentStreak: 0,
  bestStreak: 0,

  startSession: (mode: LearningMode, words: VocabularyWord[]) => {
    const now = Date.now();
    set({
      isActive: true,
      mode,
      sessionId: generateId(),
      startTime: now,
      lastWordTime: now,
      words,
      currentIndex: 0,
      reviews: [],
      xpEarned: 0,
      isFlipped: false,
      showResult: false,
      selectedAnswer: null,
      typedAnswer: '',
      currentStreak: 0,
      bestStreak: 0,
    });
  },

  endSession: () => {
    const state = get();
    const duration = state.startTime ? Date.now() - state.startTime : 0;
    const correctCount = state.reviews.filter((r) => r.correct).length;
    const accuracy = state.reviews.length > 0
      ? Math.round((correctCount / state.reviews.length) * 100)
      : 0;

    const summary: SessionSummary = {
      mode: state.mode || 'flashcard',
      duration,
      wordsReviewed: state.reviews.length,
      correctCount,
      accuracy,
      xpEarned: state.xpEarned,
      isPerfect: correctCount === state.reviews.length && state.reviews.length > 0,
      reviews: state.reviews,
    };

    set({
      isActive: false,
      mode: null,
      sessionId: null,
      startTime: null,
      lastWordTime: null,
      words: [],
      currentIndex: 0,
      reviews: [],
      xpEarned: 0,
      isFlipped: false,
      showResult: false,
      selectedAnswer: null,
      typedAnswer: '',
      currentStreak: 0,
      bestStreak: 0,
    });

    return summary;
  },

  nextWord: () => {
    const { currentIndex, words } = get();
    if (currentIndex < words.length - 1) {
      set({
        currentIndex: currentIndex + 1,
        lastWordTime: Date.now(),
        isFlipped: false,
        showResult: false,
        selectedAnswer: null,
        typedAnswer: '',
      });
    }
  },

  previousWord: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({
        currentIndex: currentIndex - 1,
        isFlipped: false,
        showResult: false,
        selectedAnswer: null,
        typedAnswer: '',
      });
    }
  },

  flipCard: () => {
    set((state) => ({ isFlipped: !state.isFlipped }));
  },

  rateCard: (quality: number) => {
    const state = get();
    const currentWord = state.words[state.currentIndex];
    if (!currentWord) return;

    const correct = quality >= 3;
    const review: ReviewWord = {
      wordId: currentWord.id,
      quality,
      responseTime: state.lastWordTime ? Date.now() - state.lastWordTime : 0,
      correct,
    };

    const newStreak = correct ? state.currentStreak + 1 : 0;
    const newBest = Math.max(state.bestStreak, newStreak);

    set({
      reviews: [...state.reviews, review],
      currentStreak: newStreak,
      bestStreak: newBest,
    });
  },

  selectAnswer: (index: number) => {
    set({ selectedAnswer: index });
  },

  submitQuizAnswer: (correct: boolean) => {
    const state = get();
    const currentWord = state.words[state.currentIndex];
    if (!currentWord) return;

    const review: ReviewWord = {
      wordId: currentWord.id,
      quality: correct ? 5 : 1,
      responseTime: state.lastWordTime ? Date.now() - state.lastWordTime : 0,
      correct,
    };

    const newStreak = correct ? state.currentStreak + 1 : 0;
    const newBest = Math.max(state.bestStreak, newStreak);

    set({
      reviews: [...state.reviews, review],
      showResult: true,
      currentStreak: newStreak,
      bestStreak: newBest,
    });
  },

  setTypedAnswer: (answer: string) => {
    set({ typedAnswer: answer });
  },

  submitTypedAnswer: (correct: boolean) => {
    const state = get();
    const currentWord = state.words[state.currentIndex];
    if (!currentWord) return;

    const review: ReviewWord = {
      wordId: currentWord.id,
      quality: correct ? 5 : 1,
      responseTime: state.lastWordTime ? Date.now() - state.lastWordTime : 0,
      correct,
    };

    const newStreak = correct ? state.currentStreak + 1 : 0;
    const newBest = Math.max(state.bestStreak, newStreak);

    set({
      reviews: [...state.reviews, review],
      showResult: true,
      currentStreak: newStreak,
      bestStreak: newBest,
    });
  },

  recordXP: (amount: number) => {
    set((state) => ({ xpEarned: state.xpEarned + amount }));
  },

  decrementXP: (amount: number) => {
    set((state) => ({ xpEarned: Math.max(0, state.xpEarned - amount) }));
  },

  undoLastReview: () => {
    const state = get();
    if (state.reviews.length === 0) return false;

    // Remove the last review from the array
    const newReviews = state.reviews.slice(0, -1);

    // Recalculate streak from remaining reviews
    let newStreak = 0;
    for (let i = newReviews.length - 1; i >= 0; i--) {
      if (newReviews[i].correct) {
        newStreak++;
      } else {
        break;
      }
    }

    // Go back to the previous card if we've moved past it
    // The number of reviews should match the number of cards we've seen
    const shouldGoBack = state.currentIndex >= newReviews.length && state.currentIndex > 0;

    set({
      reviews: newReviews,
      currentIndex: shouldGoBack ? state.currentIndex - 1 : state.currentIndex,
      currentStreak: newStreak,
      isFlipped: false,
      showResult: false,
      selectedAnswer: null,
      typedAnswer: '',
    });

    return true;
  },

  getCurrentWord: () => {
    const { words, currentIndex } = get();
    return words[currentIndex] || null;
  },

  getProgress: () => {
    const { currentIndex, words } = get();
    const total = words.length;
    const current = currentIndex + 1;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    return { current, total, percentage };
  },

  getSessionStats: () => {
    const { reviews, currentStreak, bestStreak } = get();
    const total = reviews.length;
    const correct = reviews.filter((r) => r.correct).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, accuracy, currentStreak, bestStreak };
  },
}));
