import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/src/components/Header';
import { useAuth } from '@/src/context/AuthContext';
import { useNotifications } from '@/src/context/NotificationsContext';
import { useProviderDashboard } from '@/src/hooks/useProviderDashboard';
import { getUserProfile } from '@/src/services/authService';
import { peerChatSessionId } from '@/src/services/peerChatService';
import { PALETTE, useTheme } from '@/src/theme';
import { makeProviderStyles } from './ProviderHomeScreen.styles';

const FALLBACK_AVATAR = 'https://i.pravatar.cc/100?u=madadgar-provider';

const formatWhen = (timestamp) => {
  if (!timestamp?.seconds) return 'Date TBD';
  const d = new Date(timestamp.seconds * 1000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = d >= today && d < new Date(today.getTime() + 86400000);
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today, ${time}`;
  return `${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}, ${time}`;
};

export default function ProviderHomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, role } = useAuth();
  const { unreadCount } = useNotifications();
  const styles = makeProviderStyles(colors);

  const [profile, setProfile] = useState(null);

  const {
    pending,
    today,
    weekEarnings,
    loading,
    accept,
    decline,
    refresh,
  } = useProviderDashboard(user?.uid);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    let cancelled = false;
    if (!user?.uid || !role) {
      setProfile(null);
      return;
    }
    getUserProfile(user.uid, role)
      .then((data) => !cancelled && setProfile(data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.uid, role]);

  const firstName =
    profile?.fullName?.split(' ')[0] ||
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there';
  const avatarUri =
    profile?.profilePic || profile?.photoURL || user?.photoURL || FALLBACK_AVATAR;

  const profileCompleteness = Math.min(
    100,
    [profile?.fullName, profile?.phone, profile?.profilePic, profile?.bio, profile?.categoryId]
      .filter(Boolean).length * 20,
  ) || 20;

  const rating = profile?.rating;

  const openChatFromBooking = (booking) => {
    const sessionId = peerChatSessionId(user?.uid, booking.takerId);
    if (!sessionId) return;
    router.push({
      pathname: '/chat/[sessionId]',
      params: {
        sessionId,
        peerId: booking.takerId,
        peerName: booking.takerName,
        peerAvatar: booking.takerAvatar,
        serviceLabel: booking.serviceTitle,
      },
    });
  };

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header
          variant="profileHeader"
          profileHeaderProps={{
            profileImage: avatarUri,
            username: firstName,
            unreadNotificationCount: unreadCount || pending.length,
            onAvatarPress: () => router.push('/(tabs)/profile'),
            onBellPress: () => router.push('/notifications'),
          }}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Today</Text>
              <Text style={styles.statValue}>{loading ? '—' : today.length}</Text>
              <Text style={styles.statHint}>scheduled jobs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>This week</Text>
              <Text style={styles.statValue}>
                {loading ? '—' : `PKR ${(weekEarnings / 1000).toFixed(1)}k`}
              </Text>
              <Text style={styles.statHint}>earnings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Rating</Text>
              <Text style={styles.statValue}>{rating ? rating.toFixed(1) : '—'}</Text>
              <Text style={styles.statHint}>
                from {profile?.reviewCount || 0} reviews
              </Text>
            </View>
          </View>

          {profileCompleteness < 100 && (
            <TouchableOpacity
              style={styles.nudgeCard}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <View style={styles.nudgeIconWrap}>
                <Ionicons name="alert-circle" size={22} color="#FACC15" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nudgeTitle}>
                  Complete your profile ({profileCompleteness}%)
                </Text>
                <Text style={styles.nudgeBody}>
                  Verified providers get up to 3× more bookings. Add details and a photo.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending requests</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}>
              <Text style={styles.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.accent} style={{ paddingVertical: 16 }} />
          ) : pending.length === 0 ? (
            <Text style={styles.emptyText}>No new requests yet.</Text>
          ) : (
            pending.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <Image
                  source={{ uri: req.takerAvatar || FALLBACK_AVATAR }}
                  style={styles.requestAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestName}>{req.takerName || 'Customer'}</Text>
                  <Text style={styles.requestService}>{req.serviceTitle || 'Service request'}</Text>
                  <View style={styles.requestMetaRow}>
                    <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                    <Text style={styles.requestMeta}>{formatWhen(req.scheduledAt)}</Text>
                  </View>
                  {!!req.location && (
                    <View style={styles.requestMetaRow}>
                      <FontAwesome name="map-marker" size={12} color={colors.textSecondary} />
                      <Text style={styles.requestMeta} numberOfLines={1}>
                        {req.location}
                      </Text>
                    </View>
                  )}

                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.declineBtn]}
                      onPress={() => decline(req.id)}
                    >
                      <Text style={styles.declineText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.acceptBtn]}
                      onPress={() => accept(req.id)}
                    >
                      <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's jobs</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}>
              <Text style={styles.sectionLink}>Schedule</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.accent} style={{ paddingVertical: 16 }} />
          ) : today.length === 0 ? (
            <Text style={styles.emptyText}>Nothing scheduled for today.</Text>
          ) : (
            today.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() => openChatFromBooking(job)}
              >
                <Image
                  source={{ uri: job.takerAvatar || FALLBACK_AVATAR }}
                  style={styles.requestAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestName}>{job.takerName || 'Customer'}</Text>
                  <Text style={styles.requestService}>{job.serviceTitle || 'Service'}</Text>
                  <View style={styles.requestMetaRow}>
                    <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                    <Text style={styles.requestMeta}>{formatWhen(job.scheduledAt)}</Text>
                  </View>
                </View>
                <Ionicons name="chatbubbles-outline" size={20} color={colors.accent} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/create-service')}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={26} color={PALETTE.black} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
