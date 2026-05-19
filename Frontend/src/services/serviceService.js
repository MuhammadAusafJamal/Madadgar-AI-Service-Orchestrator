import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';

import { db } from './firebaseService';

const inMemoryFilter = (items, search) => {
  if (!search) return items;
  const needle = search.toLowerCase().trim();
  if (!needle) return items;
  return items.filter((s) =>
    [s.title, s.description, s.location, s.categoryId]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(needle)),
  );
};

export const getServices = async ({ categoryIds = [], search = '', max = 50 } = {}) => {
  const constraints = [];
  if (categoryIds.length === 1) {
    constraints.push(where('categoryId', '==', categoryIds[0]));
  } else if (categoryIds.length > 1) {
    constraints.push(where('categoryId', 'in', categoryIds.slice(0, 10)));
  }
  constraints.push(limit(max));
  const q = query(collection(db, 'services'), ...constraints);
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const filtered = inMemoryFilter(items, search);
  return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
};

export const getServiceById = async (serviceId) => {
  if (!serviceId) return null;
  const snap = await getDoc(doc(db, 'services', serviceId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getServicesByProvider = async (providerId) => {
  if (!providerId) return [];
  const q = query(collection(db, 'services'), where('providerId', '==', providerId));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
};
