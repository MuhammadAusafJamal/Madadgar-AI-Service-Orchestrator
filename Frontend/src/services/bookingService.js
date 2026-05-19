import {
  addDoc,
  collection,
  getCountFromServer,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { db } from './firebaseService';

export const saveBookingForUser = async (uid, booking) => {
  if (!uid || !booking) return null;
  const ref = await addDoc(collection(db, 'bookings'), {
    ...booking,
    userId: uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getBookingsCountByUser = async (uid) => {
  if (!uid) return 0;
  const q = query(collection(db, 'bookings'), where('userId', '==', uid));
  const snap = await getCountFromServer(q);
  return snap.data().count;
};
