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

import { db } from './firebaseService';
import { sendPushToUser } from './pushService';

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

  // Push the new request to the provider. Fire-and-forget — we don't want a
  // failed notification to block the booking flow.
  if (booking.providerId) {
    sendPushToUser(booking.providerId, {
      title: 'New booking request',
      body: `${booking.serviceTitle || 'A new service'} request${booking.location ? ` in ${booking.location}` : ''}.`,
      data: { type: 'booking_requested', bookingId: ref.id },
    }).catch(() => {});
  }

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

  // Notify the taker that their request was accepted.
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      if (data.takerId) {
        sendPushToUser(data.takerId, {
          title: 'Booking accepted',
          body: `${data.providerName || 'Your provider'} accepted your ${data.serviceTitle || 'service'} booking.`,
          data: { type: 'booking_accepted', bookingId },
        }).catch(() => {});
      }
    }
  } catch (_) {
    // ignore — booking was accepted; notification is best-effort
  }
};

export const declineBooking = async (bookingId) => {
  if (!bookingId) return;
  await updateDoc(doc(db, 'bookings', bookingId), {
    status: 'declined',
    updatedAt: serverTimestamp(),
  });
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
