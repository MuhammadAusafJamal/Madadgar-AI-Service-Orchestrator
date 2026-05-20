import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';

import { useAuth } from '@/src/context/AuthContext';
import {
  IS_EXPO_GO,
  registerForPushNotificationsAsync,
  savePushToken,
} from '@/src/services/pushService';

// Registers the current user for Expo push notifications and persists their
// token on `users/{uid}` so other devices can target them. Safe to render in
// the root layout — it's a no-op when there's no logged-in user OR when
// running inside Expo Go (which doesn't support remote push since SDK 53).
export function usePushRegistration() {
  const { user } = useAuth();
  const registeredFor = useRef(null);

  useEffect(() => {
    if (IS_EXPO_GO) return undefined;
    if (!user?.uid) {
      registeredFor.current = null;
      return undefined;
    }
    if (registeredFor.current === user.uid) return undefined;
    registeredFor.current = user.uid;

    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await savePushToken(user.uid, token).catch(() => {});
      }
    })();

    const sub = Notifications.addNotificationReceivedListener(() => {});
    const respSub = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      sub.remove();
      respSub.remove();
    };
  }, [user?.uid]);
}

export default function PushRegistrar() {
  usePushRegistration();
  return null;
}