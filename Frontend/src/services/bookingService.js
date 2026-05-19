import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from './firebaseService';

const sortByScheduledAsc = (items) =>
  items.sort(
    (a, b) => (a.scheduledAt?.seconds || 0) - (b.scheduledAt?.seconds || 0),
  );

const sortByCreatedDesc = (items) =>
  items.sort(
    (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
  );

export const saveBookingForUser = async (uid, booking) => {
  if (!uid || !booking) return null;
  const ref = await addDoc(collection(db, 'bookings'), {
    ...booking,
    takerId: uid,
    status: booking.status || 'pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getBookingsCountByUser = async (uid) => {
  if (!uid) return 0;
  const q = query(collection(db, 'bookings'), where('takerId', '==', uid));
  const snap = await getCountFromServer(q);
  return snap.data().count;
};

export const getBookingsForUser = async (uid) => {
  if (!uid) return [];
  const q = query(collection(db, 'bookings'), where('takerId', '==', uid));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return sortByCreatedDesc(items);
};

export const getPendingRequestsForProvider = async (providerId) => {
  if (!providerId) return [];
  const q = query(
    collection(db, 'bookings'),
    where('providerId', '==', providerId),
    where('status', '==', 'pending'),
  );
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return sortByScheduledAsc(items);
};

export const getJobsForProvider = async (providerId) => {
  if (!providerId) return [];
  const q = query(collection(db, 'bookings'), where('providerId', '==', providerId));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return sortByScheduledAsc(items);
};

export const getTodayJobsForProvider = async (providerId) => {
  if (!providerId) return [];
  const jobs = await getJobsForProvider(providerId);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return jobs.filter((j) => {
    if (!j.scheduledAt?.seconds) return false;
    const t = j.scheduledAt.seconds * 1000;
    return (
      t >= startOfDay.getTime() &&
      t <= endOfDay.getTime() &&
      j.status !== 'declined' &&
      j.status !== 'cancelled'
    );
  });
};

export const getWeekEarningsForProvider = async (providerId) => {
  if (!providerId) return 0;
  const jobs = await getJobsForProvider(providerId);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return jobs
    .filter((j) => {
      if (!j.scheduledAt?.seconds) return false;
      const t = j.scheduledAt.seconds * 1000;
      return t >= weekAgo && (j.status === 'completed' || j.status === 'accepted');
    })
    .reduce((sum, j) => sum + (Number(j.price) || 0), 0);
};

export const acceptBooking = async (bookingId) => {
  if (!bookingId) return;
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'accepted',
    updatedAt: serverTimestamp(),
  });
};

export const declineBooking = async (bookingId) => {
  if (!bookingId) return;
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'declined',
    updatedAt: serverTimestamp(),
  });
};
