import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { IS_EXPO_GO } from '@/src/services/pushService';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAllRead: () => {},
  markRead: () => {},
  clear: () => {},
});

const storageKey = (uid) => `notifications:${uid}`;
const MAX_KEPT = 100;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const loadedForRef = useRef(null);

  // Load persisted notifications when the user changes (login / logout).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.uid) {
        if (!cancelled) setNotifications([]);
        loadedForRef.current = null;
        return;
      }
      try {
        const raw = await AsyncStorage.getItem(storageKey(user.uid));
        const parsed = raw ? JSON.parse(raw) : [];
        if (!cancelled && Array.isArray(parsed)) setNotifications(parsed);
        loadedForRef.current = user.uid;
      } catch (_) {
        if (!cancelled) setNotifications([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  // Persist on every change. Capped to MAX_KEPT to avoid runaway storage.
  useEffect(() => {
    if (!user?.uid || loadedForRef.current !== user.uid) return;
    const capped = notifications.slice(0, MAX_KEPT);
    AsyncStorage.setItem(storageKey(user.uid), JSON.stringify(capped)).catch(() => {});
  }, [notifications, user?.uid]);

  const addNotification = useCallback((entry) => {
    if (!entry) return;
    setNotifications((prev) => [
      {
        id: entry.id || makeId(),
        title: entry.title || 'Madadgar',
        body: entry.body || '',
        data: entry.data || {},
        receivedAt: entry.receivedAt || new Date().toISOString(),
        read: !!entry.read,
      },
      ...prev,
    ]);
  }, []);

  // Hook into Expo notification listeners. Foreground arrivals AND user taps
  // on a backgrounded notification both feed into the same store.
  // Disabled in Expo Go since remote push isn't supported there and the API
  // calls would log warnings on every render.
  useEffect(() => {
    if (IS_EXPO_GO) return undefined;

    const ingest = (notification) => {
      const content = notification?.request?.content;
      if (!content) return;
      addNotification({
        title: content.title,
        body: content.body,
        data: content.data,
      });
    };

    const receivedSub = Notifications.addNotificationReceivedListener(ingest);
    const respSub = Notifications.addNotificationResponseReceivedListener((response) => {
      ingest(response?.notification);
    });

    return () => {
      receivedSub.remove();
      respSub.remove();
    };
  }, [addNotification]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clear = useCallback(() => setNotifications([]), []);

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0),
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAllRead,
      markRead,
      clear,
    }),
    [notifications, unreadCount, addNotification, markAllRead, markRead, clear],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);