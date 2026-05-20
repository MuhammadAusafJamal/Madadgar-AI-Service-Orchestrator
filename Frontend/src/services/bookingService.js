import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { sendBookingEmail } from '../api/endpoints/email';
import { db } from './firebaseService';

const sortByScheduledAsc = (items) =>
  items.sort(
    (a, b) => (a.scheduledAt?.seconds || 0) - (b.scheduledAt?.seconds || 0),
  );

const sortByCreatedDesc = (items) =>
  items.sort(
    (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
  );

// Fetch a booking and fire its status-change emails. Best-effort: any failure
// here must never surface to the caller that changed the booking status.
const notifyBookingEvent = (event, ref) => {
  getDoc(ref)
    .then((snap) =>
      snap.exists()
        ? sendBookingEmail({ event, booking: { id: snap.id, ...snap.data() } })
        : null,
    )
    .catch(() => {});
};

export const saveBookingForUser = async (uid, booking) => {
  if (!uid || !booking) return null;
  const ref = await addDoc(collection(db, 'bookings'), {
    ...booking,
    takerId: uid,
    status: booking.status || 'pending',
    createdAt: serverTimestamp(),
  });
  // Best-effort confirmation emails (to the taker and the provider). Fire and
  // forget so an email/backend issue never blocks or delays the booking.
  sendBookingEmail({
    event: 'created',
    booking: { id: ref.id, ...booking },
  }).catch(() => {});
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
  const ref = doc(db, 'bookings', bookingId);
  await updateDoc(ref, {
    status: 'accepted',
    updatedAt: serverTimestamp(),
  });
  notifyBookingEvent('accepted', ref);
};

export const declineBooking = async (bookingId) => {
  if (!bookingId) return;
  const ref = doc(db, 'bookings', bookingId);
  await updateDoc(ref, {
    status: 'declined',
    updatedAt: serverTimestamp(),
  });
  notifyBookingEvent('declined', ref);
};

export const markBookingCompleted = async (bookingId) => {
  if (!bookingId) return;
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'completed',
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const markBookingReviewed = async (bookingId) => {
  if (!bookingId) return;
  await updateDoc(doc(db, 'bookings', bookingId), {
    reviewed: true,
    updatedAt: serverTimestamp(),
  });
};
