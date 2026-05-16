import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseService';

export const registerUser = async (email, password, role, additionalData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const collectionName = role === 'provider' ? 'providers' : 'service_takers';
    
    // Save to role-specific collection
    await setDoc(doc(db, collectionName, user.uid), {
      uid: user.uid,
      role,
      email,
      ...additionalData,
      createdAt: serverTimestamp()
    });

    // Also save a mapping in a generic users collection for easy role lookup
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      role,
      email
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch user role
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return { user, role: userDoc.data().role };
    }
    return { user, role: null };
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  return signOut(auth);
};

export const resetPassword = async (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const getUserRole = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data().role;
  }
  return null;
};
