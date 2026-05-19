import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { db } from './firebaseService';

const favDocId = (uid, itemId) => `${uid}_${itemId}`;

export const isFavourite = async (uid, itemId) => {
  if (!uid || !itemId) return false;
  const snap = await getDoc(doc(db, 'favourites', favDocId(uid, itemId)));
  return snap.exists();
};

export const setFavourite = async (uid, itemId, itemData = {}) => {
  if (!uid || !itemId) return;
  await setDoc(doc(db, 'favourites', favDocId(uid, itemId)), {
    userId: uid,
    itemId,
    itemData,
    createdAt: serverTimestamp(),
  });
};

export const unsetFavourite = async (uid, itemId) => {
  if (!uid || !itemId) return;
  await deleteDoc(doc(db, 'favourites', favDocId(uid, itemId)));
};

export const toggleFavourite = async (uid, itemId, itemData = {}) => {
  const exists = await isFavourite(uid, itemId);
  if (exists) {
    await unsetFavourite(uid, itemId);
    return false;
  }
  await setFavourite(uid, itemId, itemData);
  return true;
};

export const getFavouritesCountByUser = async (uid) => {
  if (!uid) return 0;
  const q = query(collection(db, 'favourites'), where('userId', '==', uid));
  const snap = await getCountFromServer(q);
  return snap.data().count;
};

export const getFavouritesForUser = async (uid) => {
  if (!uid) return [];
  const q = query(collection(db, 'favourites'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      itemId: data.itemId,
      itemData: data.itemData || {},
      createdAt: data.createdAt,
    };
  });
};
