import { collection, doc, getDoc, getDocs, limit, query } from 'firebase/firestore';

import { db } from './firebaseService';

export const getFeaturedProviders = async (max = 6) => {
  const q = query(collection(db, 'providers'), limit(max * 4));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return items
    .filter((p) => typeof p.rating === 'number')
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, max);
};

export const getAllProviders = async () => {
  const snap = await getDocs(collection(db, 'providers'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getProviderById = async (providerId) => {
  if (!providerId) return null;
  const snap = await getDoc(doc(db, 'providers', providerId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
