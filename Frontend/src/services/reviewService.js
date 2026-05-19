import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit as fbLimit,
  query,
  runTransaction,
  serverTimestamp,
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

const updateAggregateRating = async (collectionName, id, stars) => {
  if (!id) return;
  const ref = doc(db, collectionName, id);
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const prevRating = Number(data.rating) || 0;
    const prevCount = Number(data.reviewCount) || 0;
    const newCount = prevCount + 1;
    const newRating = (prevRating * prevCount + stars) / newCount;
    txn.update(ref, {
      rating: Math.round(newRating * 10) / 10,
      reviewCount: newCount,
    });
  });
};

export const addReview = async (review) => {
  const { serviceId, providerId, takerId, takerName, takerAvatar, stars, text } = review;
  if (!serviceId || !providerId || !stars) return null;

  const docRef = await addDoc(collection(db, 'reviews'), {
    serviceId,
    providerId,
    takerId,
    takerName: takerName || 'Customer',
    takerAvatar: takerAvatar || null,
    stars: Number(stars),
    text: text || '',
    createdAt: serverTimestamp(),
  });

  await Promise.all([
    updateAggregateRating('services', serviceId, Number(stars)),
    updateAggregateRating('providers', providerId, Number(stars)),
  ]);

  return docRef.id;
};
