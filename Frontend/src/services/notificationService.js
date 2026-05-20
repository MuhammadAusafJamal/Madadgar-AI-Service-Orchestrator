import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from './firebaseService';

// In-app notification feed. Booking events write a notification document for
// the relevant user; the Notifications screen reads and clears them.

// Create a notification for a user. Best-effort — never throws, so an in-app
// notification failing can't block the booking action that triggered it.
export const addNotification = async (userId, { title, body, type, bookingId } = {}) => {
  if (!userId || !title) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      body: body || '',
      type: type || 'general',
      bookingId: bookingId || null,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // ignore
  }
};

// All notifications for a user, newest first.
export const getNotificationsForUser = async (userId) => {
  if (!userId) return [];
  const q = query(collection(db, 'notifications'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return items.sort(
    (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
  );
};

// Delete every notification for a user — powers the "Clear All" action.
export const clearNotificationsForUser = async (userId) => {
  if (!userId) return;
  const q = query(collection(db, 'notifications'), where('userId', '==', userId));
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
};
