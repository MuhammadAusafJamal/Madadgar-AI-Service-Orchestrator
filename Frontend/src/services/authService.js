import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

import { auth, db } from './firebaseService';

export const registerUser = async (email, password, role, additionalData) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const collectionName = role === 'provider' ? 'providers' : 'service_takers';

  await setDoc(doc(db, collectionName, user.uid), {
    uid: user.uid,
    role,
    email,
    ...additionalData,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    role,
    email,
  });

  return user;
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    return { user, role: userDoc.data().role };
  }
  return { user, role: null };
};

export const logoutUser = async () => signOut(auth);

export const resetPassword = async (email) => sendPasswordResetEmail(auth, email);

export const getUserRole = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data().role;
  }
  return null;
};

export const getUserProfile = async (uid, role) => {
  if (!uid || !role) return null;
  const collectionName = role === 'provider' ? 'providers' : 'service_takers';
  const profileDoc = await getDoc(doc(db, collectionName, uid));
  return profileDoc.exists() ? profileDoc.data() : null;
};

export const updateUserProfile = async (uid, role, updates) => {
  if (!uid || !role) return;
  const collectionName = role === 'provider' ? 'providers' : 'service_takers';
  await updateDoc(doc(db, collectionName, uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Map a raw Firebase Auth error into a short, user-friendly message safe to
// show directly in the UI. Anything we don't recognise falls back to a generic
// message instead of leaking "Firebase: Error (auth/…)" strings to the user.
const AUTH_ERROR_MESSAGES = {
  'auth/invalid-credential': 'Incorrect email or password. Please try again.',
  'auth/wrong-password': 'Incorrect email or password. Please try again.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/email-already-in-use':
    'An account already exists with this email. Try logging in instead.',
  'auth/weak-password': 'Password is too weak — use at least 6 characters.',
  'auth/missing-password': 'Please enter your password.',
  'auth/missing-email': 'Please enter your email address.',
  'auth/too-many-requests':
    'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed':
    'Network error. Check your internet connection and try again.',
  'auth/operation-not-allowed': 'This sign-in method is currently unavailable.',
  'auth/internal-error': 'Something went wrong on our end. Please try again.',
};

export const getAuthErrorMessage = (error) =>
  AUTH_ERROR_MESSAGES[error?.code] || 'Something went wrong. Please try again.';
