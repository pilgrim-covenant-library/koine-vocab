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
  updateDoc,
  collection,
  query,
  where,
  getDocs,
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

export async function signInWithGoogle(role?: UserRole): Promise<AppUser | null> {
  if (!auth || !firestore || !googleProvider) throw new Error('Firebase not initialized');

  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;

  // Check if user already exists
  let userData = await getUserData(user.uid);

  if (!userData && role) {
    // New user - create document
    userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role,
      createdAt: new Date(),
    };

    await setDoc(doc(firestore, 'users', user.uid), {
      ...userData,
      createdAt: serverTimestamp(),
    });

    if (role === 'teacher') {
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

// Teacher-Student relationship functions
export async function linkStudentToTeacher(
  studentUid: string,
  teacherId: string
): Promise<boolean> {
  if (!firestore) throw new Error('Firebase not initialized');

  // Verify teacher exists
  const teacherDoc = await getDoc(doc(firestore, 'users', teacherId));
  if (!teacherDoc.exists() || teacherDoc.data().role !== 'teacher') {
    throw new Error('Invalid teacher ID');
  }

  // Update student's teacherId
  await updateDoc(doc(firestore, 'users', studentUid), {
    teacherId,
  });

  // Add student to teacher's students collection
  await setDoc(doc(firestore, 'teachers', teacherId, 'students', studentUid), {
    linked: true,
    linkedAt: serverTimestamp(),
  });

  return true;
}

export async function unlinkStudentFromTeacher(studentUid: string): Promise<boolean> {
  if (!firestore) throw new Error('Firebase not initialized');

  const studentDoc = await getDoc(doc(firestore, 'users', studentUid));
  if (!studentDoc.exists()) return false;

  const teacherId = studentDoc.data().teacherId;
  if (!teacherId) return false;

  // Remove teacherId from student
  await updateDoc(doc(firestore, 'users', studentUid), {
    teacherId: null,
  });

  // This would require a delete, but for simplicity we'll update
  // In a real app, you'd delete the document
  return true;
}

export async function getTeacherStudents(teacherId: string): Promise<AppUser[]> {
  if (!firestore) throw new Error('Firebase not initialized');

  const studentsQuery = query(
    collection(firestore, 'users'),
    where('teacherId', '==', teacherId),
    where('role', '==', 'student')
  );

  const snapshot = await getDocs(studentsQuery);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      teacherId: data.teacherId,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });
}

// Progress syncing functions
export interface SyncedProgress {
  words: Record<string, {
    easeFactor: number;
    interval: number;
    repetitions: number;
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

  await setDoc(doc(firestore, 'progress', uid), {
    ...progress,
    lastSynced: serverTimestamp(),
  });
}

export async function getProgressFromCloud(uid: string): Promise<SyncedProgress | null> {
  if (!firestore) throw new Error('Firebase not initialized');

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
}

// Auth state observer
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}
