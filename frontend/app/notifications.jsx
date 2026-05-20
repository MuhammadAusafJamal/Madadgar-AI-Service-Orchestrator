import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/src/components/Header';
import { useNotifications } from '@/src/context/NotificationsContext';
import { FONTS, PALETTE, useTheme } from '@/src/theme';

const formatWhen = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const iconFor = (type) => {
  switch (type) {
    case 'booking_requested':
      return { name: 'calendar-outline', color: PALETTE.golden };
    case 'booking_accepted':
      return { name: 'checkmark-circle-outline', color: '#34D399' };
    default:
      return { name: 'notifications-outline', color: PALETTE.golden };
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { notifications, markAllRead, markRead, clear, unreadCount } = useNotifications();

  // Mark everything read when the user opens this screen so the badge clears.
  useEffect(() => {
    if (unreadCount > 0) markAllRead();
  }, [unreadCount, markAllRead]);

  const handleTap = (item) => {
    markRead(item.id);
    const bookingId = item?.data?.bookingId;
    const type = item?.data?.type;
    if (bookingId && (type === 'booking_accepted' || type === 'booking_requested')) {
      router.push('/(tabs)/bookings');
    }
  };

  return (
    <SafeAreaView style={styles.area} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title="Notifications"
        actionText={notifications.length > 0 ? 'Clear' : undefined}
        onActionPress={clear}
      />

      {notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="notifications-off-outline" size={36} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyHint}>
            Booking updates from your providers and customers will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const ic = iconFor(item?.data?.type);
            return (
              <TouchableOpacity
                style={[styles.row, !item.read && styles.rowUnread]}
                activeOpacity={0.85}
                onPress={() => handleTap(item)}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${ic.color}22` }]}>
                  <Ionicons name={ic.name} size={20} color={ic.color} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.body} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={styles.meta}>{formatWhen(item.receivedAt)}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    area: { flex: 1, backgroundColor: colors.background },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      gap: 8,
    },
    emptyTitle: {
      ...FONTS.bodyMedium,
      color: colors.text,
      fontWeight: '700',
      marginTop: 8,
    },
    emptyHint: {
      ...FONTS.small,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowUnread: {
      backgroundColor: colors.surface,
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    body: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    meta: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: PALETTE.golden,
    },
  });