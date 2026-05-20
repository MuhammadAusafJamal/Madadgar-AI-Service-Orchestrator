import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ============================================================================
// Reminder timing configuration
// ============================================================================
// Normal mode: the reminder fires REMINDER_LEAD_MINUTES before the appointment.
export const REMINDER_LEAD_MINUTES = 60;

// 🧪 TEST / DEMO MODE
// When REMINDER_TEST_SECONDS is greater than 0, the reminder IGNORES the real
// appointment time and instead fires this many seconds from *now* — so you can
// see it during a demo without waiting an hour.
// Set it back to 0 to use the real REMINDER_LEAD_MINUTES behaviour.
export const REMINDER_TEST_SECONDS = 15;
// ============================================================================

const CHANNEL_ID = 'booking-reminders';

// Show the notification even when the app is open in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permission and (on Android) create the channel.
// Returns true when notifications are allowed.
export async function ensureNotificationPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Booking Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

// Decide WHEN the reminder for this booking should fire.
// Returns a Date, or null when there is nothing valid to schedule.
function computeReminderDate(appointmentISO) {
  // Test mode wins: fire shortly from now, ignoring the appointment time.
  if (REMINDER_TEST_SECONDS > 0) {
    return new Date(Date.now() + REMINDER_TEST_SECONDS * 1000);
  }
  if (!appointmentISO) return null;
  const appointment = new Date(appointmentISO);
  if (Number.isNaN(appointment.getTime())) return null;
  const fireAt = new Date(
    appointment.getTime() - REMINDER_LEAD_MINUTES * 60 * 1000,
  );
  // Never schedule a reminder that is already in the past.
  if (fireAt.getTime() <= Date.now()) return null;
  return fireAt;
}

// Schedule a local reminder notification for a booking.
// Best-effort: returns { id, fireAt } or null — never throws.
export async function scheduleBookingReminder(booking) {
  try {
    const fireDate = computeReminderDate(booking?.scheduledFor);
    if (!fireDate) return null;

    const allowed = await ensureNotificationPermission();
    if (!allowed) return null;

    const service = booking?.serviceTitle || 'your booking';
    const withProvider = booking?.providerName
      ? ` with ${booking.providerName}`
      : '';

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Upcoming booking reminder',
        body: `Your ${service}${withProvider} is coming up soon.`,
        data: { type: 'booking-reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
        channelId: CHANNEL_ID,
      },
    });
    return { id, fireAt: fireDate.toISOString() };
  } catch (err) {
    return null;
  }
}

// Cancel a previously scheduled reminder. Best-effort — never throws.
export async function cancelBookingReminder(reminderId) {
  if (!reminderId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(reminderId);
  } catch (err) {
    // ignore — cancelling a missing/expired reminder is harmless
  }
}
