import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { db } from './firebaseService';

export const peerChatSessionId = (uidA, uidB) => {
  if (!uidA || !uidB) return null;
  return [uidA, uidB].sort().join('__');
};

export const ensureChatSession = async (sessionId, meta = {}) => {
  if (!sessionId) return;
  const ref = doc(db, 'chats', sessionId);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    ...meta,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToPeerChat = (sessionId, onMessages) => {
  if (!sessionId) return () => {};
  const q = query(
    collection(db, 'chats', sessionId, 'messages'),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onMessages(msgs);
  });
};

export const sendPeerMessage = async (sessionId, senderId, text) => {
  const trimmed = text?.trim();
  if (!sessionId || !senderId || !trimmed) return null;
  const ref = await addDoc(collection(db, 'chats', sessionId, 'messages'), {
    senderId,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};
