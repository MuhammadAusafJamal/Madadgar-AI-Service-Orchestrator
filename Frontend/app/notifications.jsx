import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/src/components/Header';
import { useAuth } from '@/src/context/AuthContext';
import {
  clearNotificationsForUser,
  getNotificationsForUser,
} from '@/src/services/notificationService';
import { FONTS, useTheme } from '@/src/theme';

// Map a notification type to an icon.
const TYPE_ICON = {
  booking_created: 'paper-plane-outline',
  booking_request: 'mail-unread-outline',
  booking_accepted: 'checkmark-circle-outline',
  booking_declined: 'close-circle-outline',
  booking_completed: 'ribbon-outline',
  reminder: 'alarm-outline',
  general: 'notifications-outline',
};

// Firestore Timestamp → "2h ago" style label.
const timeAgo = (ts) => {
  const seconds = ts?.seconds;
  if (!seconds) return '';
  const diffMs = Date.now() - seconds * 1000;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(seconds * 1000).toLocaleDateString();
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = makeStyles(colors);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setItems(await getNotificationsForUser(user.uid));
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleClearAll = () => {
    if (items.length === 0 || !user?.uid) return;
    Alert.alert(
      'Clear all notifications?',
      'This permanently removes every notification.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setItems([]);
            try {
              await clearNotificationsForUser(user.uid);
            } catch (e) {
              load();
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={TYPE_ICON[item.type] || TYPE_ICON.general}
          size={18}
          color={colors.accent}
        />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        {!!item.body && <Text style={styles.rowText}>{item.body}</Text>}
        <Text style={styles.rowTime}>{timeAgo(item.createdAt)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.area} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title="Notifications"
        actionText={items.length > 0 ? 'Clear All' : undefined}
        onActionPress={handleClearAll}
      />
      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ paddingVertical: 32 }} />
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons
            name="notifications-off-outline"
            size={40}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyHint}>Booking updates will show up here.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    area: { flex: 1, backgroundColor: colors.background },
    listContent: { padding: 16, gap: 10 },
    row: {
      flexDirection: 'row',
      gap: 12,
      padding: 12,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowBody: { flex: 1, gap: 2 },
    rowTitle: {
      ...FONTS.bodyMedium,
      color: colors.text,
      fontWeight: '700',
    },
    rowText: {
      ...FONTS.small,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    rowTime: {
      ...FONTS.small,
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 32,
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
  });
