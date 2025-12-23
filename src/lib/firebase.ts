import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  getDocs,
  orderBy,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';

// Firebase configuration - Replace with your own config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Check if Firebase is properly configured
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain
);

// Initialize Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (typeof window !== 'undefined' && isFirebaseConfigured) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    app = null;
    db = null;
  }
}

export const auth = typeof window !== 'undefined' && app ? getAuth(app) : null;
export const firestore = db;

// Export a function to check if Firebase is available
export function isFirebaseAvailable(): boolean {
  return isFirebaseConfigured && auth !== null;
}

// =============================================================================
// Retry Logic for Network Operations
// =============================================================================

/**
 * Retry an async operation with exponential backoff
 * @param operation - The async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay in ms (default: 1000)
 * @returns Promise with the operation result
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Don't retry auth errors or permission errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes('permission') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('unauthenticated')
        ) {
          throw error;
        }
      }

      // Exponential backoff: delay increases with each attempt
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// User role types
export type UserRole = 'student' | 'teacher';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  teacherId?: string;
  createdAt: Date;
}

// Google Provider - only initialize if Firebase is configured
const googleProvider = auth ? new GoogleAuthProvider() : null;

// Auth functions
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  role: UserRole
): Promise<AppUser> {
  if (!auth || !firestore) throw new Error('Firebase not initialized');

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update display name
  await updateProfile(user, { displayName });

  // Create user document in Firestore
  const userData: AppUser = {
    uid: user.uid,
    email: user.email,
    displayName,
    role,
    createdAt: new Date(),
  };

  await setDoc(doc(firestore, 'users', user.uid), {
    ...userData,
    createdAt: serverTimestamp(),
  });

  // If teacher, create teachers collection entry
  if (role === 'teacher') {
    await setDoc(doc(firestore, 'teachers', user.uid), {
      studentIds: [],
      createdAt: serverTimestamp(),
    });
  }

  return userData;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AppUser | null> {
  if (!auth || !firestore) throw new Error('Firebase not initialized');

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return getUserData(userCredential.user.uid);
}

// Admin emails that automatically get teacher role
const ADMIN_EMAILS = ['keratinqw@gmail.com'];

export async function signInWithGoogle(role?: UserRole): Promise<AppUser | null> {
  if (!auth || !firestore || !googleProvider) throw new Error('Firebase not initialized');

  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;

  // Check if user already exists
  let userData = await getUserData(user.uid);

  // Auto-assign teacher role for admin emails
  const isAdmin = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  const effectiveRole = isAdmin ? 'teacher' : role;

  if (!userData && effectiveRole) {
    // New user - create document
    userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: effectiveRole,
      createdAt: new Date(),
    };

    await setDoc(doc(firestore, 'users', user.uid), {
      ...userData,
      createdAt: serverTimestamp(),
    });

    if (effectiveRole === 'teacher') {
      await setDoc(doc(firestore, 'teachers', user.uid), {
        studentIds: [],
        createdAt: serverTimestamp(),
      });
    }
  }

  return userData;
}

export async function signOut(): Promise<void> {
  if (!auth) throw new Error('Firebase not initialized');
  await firebaseSignOut(auth);
}

export async function getUserData(uid: string): Promise<AppUser | null> {
  if (!firestore) throw new Error('Firebase not initialized');

  const docRef = doc(firestore, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      teacherId: data.teacherId,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  }

  return null;
}

// Progress syncing functions
export interface SyncedProgress {
  words: Record<string, {
    easeFactor: number;
    interval: number;
    repetitions: number;
    maxRepetitions?: number; // Optional for backwards compatibility with existing data
    nextReview: string;
    lastReview: string | null;
    lastQuality: number;
    timesReviewed: number;
    timesCorrect: number;
  }>;
  stats: {
    xp: number;
    level: number;
    streak: number;
    longestStreak: number;
    lastStudyDate: string | null;
    achievements: string[];
    wordsLearned: number;
    wordsInProgress: number;
    totalReviews: number;
    correctReviews: number;
  };
  lastSynced: Date;
}

export async function syncProgressToCloud(
  uid: string,
  progress: SyncedProgress
): Promise<void> {
  if (!firestore) throw new Error('Firebase not initialized');

  return retryOperation(async () => {
    await setDoc(doc(firestore, 'progress', uid), {
      ...progress,
      lastSynced: serverTimestamp(),
    });
  });
}

export async function getProgressFromCloud(uid: string): Promise<SyncedProgress | null> {
  if (!firestore) throw new Error('Firebase not initialized');

  return retryOperation(async () => {
    const docRef = doc(firestore, 'progress', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        words: data.words || {},
        stats: data.stats || {},
        lastSynced: data.lastSynced?.toDate() || new Date(),
      };
    }

    return null;
  });
}

// Auth state observer
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

// =============================================================================
// Homework Progress Sync Functions
// =============================================================================

import type { Homework1Progress, SectionProgress, SectionId, HomeworkSubmission } from '@/types/homework';

// Type for Firestore-serializable homework data
interface FirestoreHomeworkProgress {
  id: 'hw1';
  status: 'not_started' | 'in_progress' | 'completed';
  sections: Record<string, SectionProgress>;
  currentSection: number;
  startedAt?: number;
  completedAt?: number;
  totalScore: number;
  totalPossible: number;
  lastSynced: ReturnType<typeof serverTimestamp>;
}

/**
 * Sync homework progress to Firestore
 */
export async function syncHomeworkToCloud(
  uid: string,
  homeworkId: string,
  progress: Homework1Progress
): Promise<void> {
  if (!firestore) throw new Error('Firebase not initialized');

  return retryOperation(async () => {
    const docRef = doc(firestore, 'homework', uid, 'assignments', homeworkId);

    // Convert sections Record to plain object for Firestore
    const sectionsData: Record<string, SectionProgress> = {};
    for (const key in progress.sections) {
      sectionsData[key] = progress.sections[key as unknown as SectionId];
    }

    const data: FirestoreHomeworkProgress = {
      id: progress.id,
      status: progress.status,
      sections: sectionsData,
      currentSection: progress.currentSection,
      startedAt: progress.startedAt,
      completedAt: progress.completedAt,
      totalScore: progress.totalScore,
      totalPossible: progress.totalPossible,
      lastSynced: serverTimestamp(),
    };

    await setDoc(docRef, data, { merge: true });
  });
}

/**
 * Get homework progress from Firestore
 */
export async function getHomeworkFromCloud(
  uid: string,
  homeworkId: string
): Promise<Homework1Progress | null> {
  if (!firestore) throw new Error('Firebase not initialized');

  return retryOperation(async () => {
    const docRef = doc(firestore, 'homework', uid, 'assignments', homeworkId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Convert sections back to proper Record type
      const sections: Record<SectionId, SectionProgress> = {
        1: data.sections['1'] || data.sections[1],
        2: data.sections['2'] || data.sections[2],
        3: data.sections['3'] || data.sections[3],
        4: data.sections['4'] || data.sections[4],
        5: data.sections['5'] || data.sections[5],
      };

      return {
        id: data.id,
        status: data.status,
        sections,
        currentSection: data.currentSection as SectionId,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        totalScore: data.totalScore,
        totalPossible: data.totalPossible,
      };
    }

    return null;
  });
}

/**
 * Get all homework assignments for a student (for teacher dashboard)
 */
export async function getStudentHomework(
  studentUid: string
): Promise<{ hw1?: Homework1Progress }> {
  if (!firestore) throw new Error('Firebase not initialized');

  const result: { hw1?: Homework1Progress } = {};

  try {
    const hw1 = await getHomeworkFromCloud(studentUid, 'hw1');
    if (hw1) {
      result.hw1 = hw1;
    }
  } catch (error) {
    console.error('Error fetching student homework:', error);
  }

  return result;
}

// =============================================================================
// Homework Submissions (for Teacher Dashboard)
// =============================================================================

/**
 * Submit homework result to the homeworkSubmissions collection
 * Called when a student completes homework
 */
export async function submitHomeworkResult(
  studentUid: string,
  hwId: string,
  userInfo: { displayName: string | null; email: string | null },
  score: number,
  totalPossible: number,
  sections: Record<string, { score: number; totalQuestions: number; status: string }>
): Promise<void> {
  if (!firestore) throw new Error('Firebase not initialized');

  return retryOperation(async () => {
    const percentage = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;

    await setDoc(doc(firestore, 'homeworkSubmissions', studentUid), {
      studentUid,
      homeworkId: hwId,
      status: 'completed',
      completedAt: serverTimestamp(),
      score,
      totalPossible,
      percentage,
      displayName: userInfo.displayName,
      email: userInfo.email,
      sections,
    });
  });
}

/**
 * Get all homework submissions (for teacher dashboard)
 * Returns all completed homework submissions sorted by completion date
 */
export async function getAllHomeworkSubmissions(): Promise<HomeworkSubmission[]> {
  if (!firestore) throw new Error('Firebase not initialized');

  return retryOperation(async () => {
    const submissionsQuery = query(
      collection(firestore, 'homeworkSubmissions'),
      orderBy('completedAt', 'desc')
    );

    const snapshot = await getDocs(submissionsQuery);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        studentUid: docSnap.id,
        homeworkId: data.homeworkId,
        status: 'completed' as const,
        completedAt: data.completedAt?.toDate() || new Date(),
        score: data.score,
        totalPossible: data.totalPossible,
        percentage: data.percentage,
        displayName: data.displayName,
        email: data.email,
        sections: data.sections,
      };
    });
  });
}

/**
 * Aliases for backward compatibility and test consistency
 */
export const loadProgressFromCloud = getProgressFromCloud;
export const loadHomeworkFromCloud = getHomeworkFromCloud;

/**
 * Sync user stats to cloud
 * TODO: Implement full stats syncing
 */
export async function syncStatsToCloud(uid: string, stats: any): Promise<void> {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  const statsRef = doc(db, 'users', uid, 'stats', 'current');
  await setDoc(statsRef, {
    ...stats,
    lastSynced: serverTimestamp(),
  }, { merge: true });
}

/**
 * Load user stats from cloud
 * TODO: Implement full stats loading
 */
export async function loadStatsFromCloud(uid: string): Promise<any | null> {
  if (!db) {
    throw new Error('Firebase not initialized');
  }

  const statsRef = doc(db, 'users', uid, 'stats', 'current');
  const snapshot = await getDoc(statsRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}
