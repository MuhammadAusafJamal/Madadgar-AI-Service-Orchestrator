import { collection, getDocs, orderBy, query } from 'firebase/firestore';

import { db } from './firebaseService';

export const getCategories = async () => {
  const q = query(collection(db, 'categories'), orderBy('sortOrder', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
