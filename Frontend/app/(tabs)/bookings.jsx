import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/src/components/Header';
import { useAuth } from '@/src/context/AuthContext';
import {
  acceptBooking,
  declineBooking,
  getBookingsForUser,
  getJobsForProvider,
} from '@/src/services/bookingService';
import { peerChatSessionId } from '@/src/services/peerChatService';
import { FONTS, PALETTE, useTheme } from '@/src/theme';

const STATUS_COLORS = {
  pending: '#FACC15',
  accepted: '#10B981',
  completed: '#3B82F6',
  declined: '#9CA3AF',
  cancelled: '#9CA3AF',
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'completed', label: 'Completed' },
];

const formatScheduled = (timestamp) => {
  if (!timestamp?.seconds) return 'Schedule TBD';
  const d = new Date(timestamp.seconds * 1000);
  return d.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function BookingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, role } = useAuth();
  const isProvider = role === 'provider';
  const styles = makeStyles(colors);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    if (!user?.uid) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = isProvider
        ? await getJobsForProvider(user.uid)
        : await getBookingsForUser(user.uid);
      setBookings(data);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, isProvider]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered =
    filter === 'all'
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const handleAccept = async (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'accepted' } : b)),
    );
    try {
      await acceptBooking(id);
    } catch {
      load();
    }
  };

  const handleDecline = async (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'declined' } : b)),
    );
    try {
      await declineBooking(id);
    } catch {
      load();
    }
  };

  const openChat = (booking) => {
    const peerId = isProvider ? booking.takerId : booking.providerId;
    const peerName = isProvider ? booking.takerName : booking.providerName;
    const peerAvatar = isProvider ? booking.takerAvatar : null;
    const sessionId = peerChatSessionId(user?.uid, peerId);
    if (!sessionId) return;
    router.push({
      pathname: '/chat/[sessionId]',
      params: {
        sessionId,
        peerId,
        peerName,
        peerAvatar,
        serviceLabel: booking.serviceTitle,
      },
    });
  };

  const renderItem = ({ item }) => {
    const statusColor = STATUS_COLORS[item.status] || colors.textSecondary;
    const peerName = isProvider
      ? item.takerName || 'Customer'
      : item.providerName || 'Provider';
    const peerAvatar = isProvider
      ? item.takerAvatar
      : `https://i.pravatar.cc/100?u=${item.providerId || 'provider'}`;

    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <Image source={{ uri: peerAvatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.peerName} numberOfLines={1}>
              {peerName}
            </Text>
            <Text style={styles.serviceTitle} numberOfLines={2}>
              {item.serviceTitle || 'Service'}
            </Text>
          </View>
          <View style={[styles.statusPill, { borderColor: statusColor }]}>
            <Text style={[styles.statusPillText, { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText}>{formatScheduled(item.scheduledAt)}</Text>
        </View>
        {!!item.location && (
          <View style={styles.metaRow}>
            <FontAwesome name="map-marker" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        )}
        {typeof item.price === 'number' && (
          <View style={styles.metaRow}>
            <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>PKR {item.price.toLocaleString()}</Text>
          </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.chatBtn} onPress={() => openChat(item)}>
            <Ionicons name="chatbubbles-outline" size={16} color={PALETTE.golden} />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>

          {isProvider && item.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.declineBtn]}
                onPress={() => handleDecline(item.id)}
              >
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => handleAccept(item.id)}
              >
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title={isProvider ? 'Jobs' : 'My Bookings'} allowBackIcon={false} />

        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => setFilter(f.id)}
              >
                <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="calendar-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>
              {isProvider ? 'No jobs yet' : 'No bookings yet'}
            </Text>
            <Text style={styles.emptyHint}>
              {isProvider
                ? 'New customer requests will show up here.'
                : 'Find a service from the home tab to make your first booking.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    area: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      marginVertical: 12,
      flexWrap: 'wrap',
    },
    filterPill: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: PALETTE.golden,
    },
    filterPillActive: {
      backgroundColor: PALETTE.golden,
    },
    filterPillText: {
      ...FONTS.small,
      color: PALETTE.golden,
      fontWeight: '600',
    },
    filterPillTextActive: {
      color: PALETTE.black,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 10,
    },
    cardTopRow: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      marginBottom: 10,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    peerName: {
      ...FONTS.bodyMedium,
      color: colors.text,
      fontWeight: '700',
    },
    serviceTitle: {
      ...FONTS.small,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    metaText: {
      ...FONTS.small,
      color: colors.textSecondary,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    chatBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: PALETTE.golden,
    },
    chatBtnText: {
      ...FONTS.small,
      color: PALETTE.golden,
      fontWeight: '700',
    },
    actionBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 18,
      alignItems: 'center',
    },
    declineBtn: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    declineText: {
      ...FONTS.small,
      color: colors.text,
      fontWeight: '600',
    },
    acceptBtn: {
      backgroundColor: PALETTE.golden,
    },
    acceptText: {
      ...FONTS.small,
      color: PALETTE.black,
      fontWeight: '700',
    },
    emptyWrap: {
      paddingVertical: 60,
      alignItems: 'center',
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
      paddingHorizontal: 40,
    },
  });
