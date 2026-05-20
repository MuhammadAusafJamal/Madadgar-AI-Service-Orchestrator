import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
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

const applySort = (items, sortBy) => {
  switch (sortBy) {
    case 'priceAsc':
      return items.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    case 'priceDesc':
      return items.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    case 'newest':
      return items.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );
    case 'rating':
    default:
      return items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
};

export const getServices = async ({
  categoryIds = [],
  search = '',
  priceMin = null,
  priceMax = null,
  sortBy = 'rating',
  max = 50,
} = {}) => {
  const constraints = [];
  if (categoryIds.length === 1) {
    constraints.push(where('categoryId', '==', categoryIds[0]));
  } else if (categoryIds.length > 1) {
    constraints.push(where('categoryId', 'in', categoryIds.slice(0, 10)));
  }
  constraints.push(limit(max));
  const q = query(collection(db, 'services'), ...constraints);
  const snap = await getDocs(q);
  let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  items = inMemoryFilter(items, search);

  if (priceMin !== null && !Number.isNaN(priceMin)) {
    items = items.filter((s) => (s.basePrice || 0) >= priceMin);
  }
  if (priceMax !== null && !Number.isNaN(priceMax)) {
    items = items.filter((s) => (s.basePrice || 0) <= priceMax);
  }

  return applySort(items, sortBy);
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

export const addService = async (providerId, service) => {
  if (!providerId || !service) return null;
  const ref = await addDoc(collection(db, 'services'), {
    ...service,
    providerId,
    rating: 0,
    reviewCount: 0,
    active: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};
