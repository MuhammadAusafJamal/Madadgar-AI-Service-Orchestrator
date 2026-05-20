import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import { db } from './firebaseService';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Expo Go (SDK 53+) no longer supports remote push notifications and will
// emit warnings/errors for every expo-notifications API call. Detect it once
// and short-circuit the whole module so nothing fires until the user runs in
// a development / production build.
export const IS_EXPO_GO = Constants?.executionEnvironment === 'storeClient';

// Foreground behavior: show the notification banner + sound even when the
// app is in the foreground. Skipped in Expo Go.
if (!IS_EXPO_GO) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function getProjectId() {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId ||
    Constants?.expoConfig?.extra?.projectId ||
    null
  );
}

export async function registerForPushNotificationsAsync() {
  // Skip everything in Expo Go — remote push was removed in SDK 53 and every
  // API call would emit warnings. Re-enabled automatically in dev/prod builds.
  if (IS_EXPO_GO) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Madadgar',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFC107',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== 'granted') return null;

  const projectId = getProjectId();
  if (!projectId || projectId === 'REPLACE_WITH_EAS_PROJECT_ID') {
    console.warn(
      '[push] Missing EAS projectId in app.json. Set extra.eas.projectId via `eas init` or manually.',
    );
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token?.data || null;
  } catch (err) {
    console.warn('[push] Failed to fetch Expo push token', err?.message);
    return null;
  }
}

export async function savePushToken(uid, token) {
  if (!uid || !token) return;
  await setDoc(
    doc(db, 'users', uid),
    { pushToken: token, pushTokenUpdatedAt: serverTimestamp() },
    { merge: true },
  );
}

async function getPushTokenForUser(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data().pushToken || null;
}

// Send a push to one or more recipients (resolved from their Firestore uid).
// Silently swallows errors so a failed push never breaks the caller's flow.
export async function sendPushToUser(recipientUid, { title, body, data } = {}) {
  try {
    const token = await getPushTokenForUser(recipientUid);
    if (!token) return false;

    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title: title || 'Madadgar',
        body: body || '',
        data: data || {},
      }),
    });
    return true;
  } catch (err) {
    console.warn('[push] sendPushToUser failed', err?.message);
    return false;
  }
}