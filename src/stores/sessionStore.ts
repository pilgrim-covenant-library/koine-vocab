import { create } from 'zustand';
import type { LearningMode, ReviewWord, VocabularyWord } from '@/types';
import { generateId } from '@/lib/utils';

interface SessionState {
  // Current session
  isActive: boolean;
  mode: LearningMode | null;
  sessionId: string | null;
  startTime: number | null;

  // Session data
  words: VocabularyWord[];
  currentIndex: number;
  reviews: ReviewWord[];

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

  // Getters
  getCurrentWord: () => VocabularyWord | null;
  getProgress: () => { current: number; total: number; percentage: number };
  getSessionStats: () => { correct: number; total: number; accuracy: number };
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
  words: [],
  currentIndex: 0,
  reviews: [],
  isFlipped: false,
  showResult: false,
  selectedAnswer: null,
  typedAnswer: '',

  startSession: (mode: LearningMode, words: VocabularyWord[]) => {
    set({
      isActive: true,
      mode,
      sessionId: generateId(),
      startTime: Date.now(),
      words,
      currentIndex: 0,
      reviews: [],
      isFlipped: false,
      showResult: false,
      selectedAnswer: null,
      typedAnswer: '',
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
      xpEarned: 0, // Will be calculated elsewhere
      isPerfect: correctCount === state.reviews.length && state.reviews.length > 0,
      reviews: state.reviews,
    };

    set({
      isActive: false,
      mode: null,
      sessionId: null,
      startTime: null,
      words: [],
      currentIndex: 0,
      reviews: [],
      isFlipped: false,
      showResult: false,
      selectedAnswer: null,
      typedAnswer: '',
    });

    return summary;
  },

  nextWord: () => {
    const { currentIndex, words } = get();
    if (currentIndex < words.length - 1) {
      set({
        currentIndex: currentIndex + 1,
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

    const review: ReviewWord = {
      wordId: currentWord.id,
      quality,
      responseTime: state.startTime ? Date.now() - state.startTime : 0,
      correct: quality >= 3,
    };

    set({
      reviews: [...state.reviews, review],
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
      responseTime: state.startTime ? Date.now() - state.startTime : 0,
      correct,
    };

    set({
      reviews: [...state.reviews, review],
      showResult: true,
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
      responseTime: state.startTime ? Date.now() - state.startTime : 0,
      correct,
    };

    set({
      reviews: [...state.reviews, review],
      showResult: true,
    });
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
    const { reviews } = get();
    const total = reviews.length;
    const correct = reviews.filter((r) => r.correct).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, accuracy };
  },
}));
