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
