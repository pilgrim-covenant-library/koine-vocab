import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from 'firebase/auth';
import {
  type AppUser,
  type UserRole,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOut as firebaseSignOut,
  getUserData,
  onAuthChange,
  linkStudentToTeacher,
  unlinkStudentFromTeacher,
  isFirebaseAvailable,
} from '@/lib/firebase';

// Re-export for use in components
export { isFirebaseAvailable };

// Track the auth listener unsubscribe function to prevent memory leaks
let currentUnsubscribe: (() => void) | null = null;

interface AuthState {
  // Auth state
  user: AppUser | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => () => void;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInGoogle: (role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  linkToTeacher: (teacherId: string) => Promise<void>;
  unlinkFromTeacher: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      initialize: () => {
        // Clean up previous listener to prevent memory leaks
        if (currentUnsubscribe) {
          currentUnsubscribe();
          currentUnsubscribe = null;
        }

        // If Firebase is not available, just mark as initialized
        if (!isFirebaseAvailable()) {
          set({
            firebaseUser: null,
            user: null,
            isLoading: false,
            isInitialized: true,
          });
          return () => {};
        }

        const unsubscribe = onAuthChange(async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const userData = await getUserData(firebaseUser.uid);
              set({
                firebaseUser,
                user: userData,
                isLoading: false,
                isInitialized: true,
              });
            } catch (error) {
              console.error('Error fetching user data:', error);
              set({
                firebaseUser,
                user: null,
                isLoading: false,
                isInitialized: true,
              });
            }
          } else {
            set({
              firebaseUser: null,
              user: null,
              isLoading: false,
              isInitialized: true,
            });
          }
        });

        // Store the unsubscribe function for cleanup
        currentUnsubscribe = unsubscribe;

        return unsubscribe;
      },

      signUp: async (email, password, displayName, role) => {
        set({ isLoading: true, error: null });
        try {
          const user = await signUpWithEmail(email, password, displayName, role);
          set({ user, isLoading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Sign up failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const user = await signInWithEmail(email, password);
          set({ user, isLoading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Sign in failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      signInGoogle: async (role) => {
        set({ isLoading: true, error: null });
        try {
          const user = await signInWithGoogle(role);
          set({ user, isLoading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Google sign in failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        set({ isLoading: true, error: null });
        try {
          await firebaseSignOut();
          set({ user: null, firebaseUser: null, isLoading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Sign out failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      linkToTeacher: async (teacherId) => {
        const { user } = get();
        if (!user) throw new Error('Not authenticated');
        if (user.role !== 'student') throw new Error('Only students can link to teachers');

        set({ isLoading: true, error: null });
        try {
          await linkStudentToTeacher(user.uid, teacherId);
          set({
            user: { ...user, teacherId },
            isLoading: false,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to link to teacher';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      unlinkFromTeacher: async () => {
        const { user } = get();
        if (!user) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });
        try {
          await unlinkStudentFromTeacher(user.uid);
          set({
            user: { ...user, teacherId: undefined },
            isLoading: false,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Failed to unlink from teacher';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'koine-auth-store',
      partialize: (state) => ({
        // Don't persist sensitive data
      }),
    }
  )
);
