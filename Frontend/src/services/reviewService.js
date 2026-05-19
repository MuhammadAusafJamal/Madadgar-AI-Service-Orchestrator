import {
  collection,
  getDocs,
  limit as fbLimit,
  query,
  where,
} from 'firebase/firestore';

import { db } from './firebaseService';

const sortByCreatedDesc = (items) =>
  items.sort(
    (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
  );

export const getReviewsForService = async (serviceId, max = 20) => {
  if (!serviceId) return [];
  const q = query(
    collection(db, 'reviews'),
    where('serviceId', '==', serviceId),
    fbLimit(max),
  );
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return sortByCreatedDesc(items);
};

export const getReviewsForProvider = async (providerId, max = 20) => {
  if (!providerId) return [];
  const q = query(
    collection(db, 'reviews'),
    where('providerId', '==', providerId),
    fbLimit(max),
  );
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return sortByCreatedDesc(items);
};
