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
import { addNotification } from './notificationService';
import { scheduleBookingReminder } from './reminderService';

const sortByScheduledAsc = (items) =>
  items.sort(
    (a, b) => (a.scheduledAt?.seconds || 0) - (b.scheduledAt?.seconds || 0),
  );

const sortByCreatedDesc = (items) =>
  items.sort(
    (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
  );

// Templates for the in-app notification fired to the taker on a status change.
const STATUS_NOTIFICATION = {
  accepted: (b) => ({
    title: 'Booking accepted',
    body: `${b.providerName || 'The provider'} accepted your ${b.serviceTitle || 'service'} booking.`,
    type: 'booking_accepted',
  }),
  declined: (b) => ({
    title: 'Booking declined',
    body: `${b.providerName || 'The provider'} declined your ${b.serviceTitle || 'service'} booking.`,
    type: 'booking_declined',
  }),
  completed: (b) => ({
    title: 'Service completed',
    body: `Your ${b.serviceTitle || 'service'} booking is complete — leave a review!`,
    type: 'booking_completed',
  }),
};

// Fetch a booking and fire its status-change side effects — a status email and
// an in-app notification for the taker. Best-effort: any failure here must
// never surface to the caller that changed the booking status.
const notifyBookingEvent = (event, ref) => {
  getDoc(ref)
    .then((snap) => {
      if (!snap.exists()) return;
      const booking = { id: snap.id, ...snap.data() };
      sendBookingEmail({ event, booking }).catch(() => {});
      const template = STATUS_NOTIFICATION[event];
      if (template && booking.takerId) {
        addNotification(booking.takerId, {
          ...template(booking),
          bookingId: booking.id,
        });
      }
    })
    .catch(() => {});
};

export const saveBookingForUser = async (uid, booking) => {
  if (!uid || !booking) return null;

  // Schedule the appointment reminder on the taker's device first, so its
  // id can be persisted on the booking. Best-effort — returns null if
  // notifications are blocked or there's nothing valid to schedule.
  const reminder = await scheduleBookingReminder(booking);

  const ref = await addDoc(collection(db, 'bookings'), {
    ...booking,
    takerId: uid,
    status: booking.status || 'pending',
    reminderId: reminder?.id || null,
    reminderAt: reminder?.fireAt || null,
    createdAt: serverTimestamp(),
  });
  // Best-effort confirmation emails (to the taker and the provider). Fire and
  // forget so an email/backend issue never blocks or delays the booking.
  sendBookingEmail({
    event: 'created',
    booking: { id: ref.id, ...booking },
  }).catch(() => {});

  // In-app notifications: confirm to the taker, alert the provider.
  addNotification(uid, {
    title: 'Booking request sent',
    body: `Your request for ${booking.serviceTitle || 'a service'} was sent to ${booking.providerName || 'the provider'}.`,
    type: 'booking_created',
    bookingId: ref.id,
  });
  if (booking.providerId) {
    addNotification(booking.providerId, {
      title: 'New booking request',
      body: `${booking.takerName || 'A customer'} requested ${booking.serviceTitle || 'your service'}.`,
      type: 'booking_request',
      bookingId: ref.id,
    });
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
  const ref = doc(db, 'bookings', bookingId);
  await updateDoc(ref, {
    status: 'completed',
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  notifyBookingEvent('completed', ref);
};

export const markBookingReviewed = async (bookingId) => {
  if (!bookingId) return;
  await updateDoc(doc(db, 'bookings', bookingId), {
    reviewed: true,
    updatedAt: serverTimestamp(),
  });
};
