import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/src/components/Header';
import ServiceCard from '@/src/components/ServiceCard';
import { useAuth } from '@/src/context/AuthContext';
import {
  getJobsForProvider,
  getWeekEarningsForProvider,
} from '@/src/services/bookingService';
import { getFavouritesForUser } from '@/src/services/favouriteService';
import { FONTS, PALETTE, useTheme } from '@/src/theme';

const formatPriceLabel = (item) => {
  if (typeof item?.basePrice !== 'number') return '';
  const price = `PKR ${item.basePrice.toLocaleString()}`;
  return item.priceUnit ? `${price} · ${item.priceUnit}` : price;
};

function TakerFavourites() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = makeStyles(colors);

  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.uid) {
      setFavourites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const items = await getFavouritesForUser(user.uid);
      setFavourites(items);
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

  const openItem = (fav) => {
    const item = fav.itemData || {};
    router.push({
      pathname: '/service/[id]',
      params: { id: fav.itemId },
    });
  };

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Favourites" allowBackIcon={false} />
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
        ) : favourites.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="heart-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No favourites yet</Text>
            <Text style={styles.emptyHint}>
              Tap the heart on any service to save it here for later.
            </Text>
          </View>
        ) : (
          <FlatList
            data={favourites}
            numColumns={2}
            keyExtractor={(fav) => fav.id}
            renderItem={({ item: fav }) => {
              const item = fav.itemData || {};
              return (
                <ServiceCard
                  itemId={fav.itemId}
                  itemData={item}
                  providerName={item.title || item.fullName || 'Service'}
                  eventDateTime={
                    formatPriceLabel(item) ||
                    (item.rating ? `★ ${item.rating}` : 'Saved')
                  }
                  image={item.image || `https://picsum.photos/seed/${fav.itemId}/600/400`}
                  location={item.location || (item.serviceAreas || []).join(', ') || '—'}
                  onPress={() => openItem(fav)}
                />
              );
            }}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
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

function ProviderEarnings() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = makeStyles(colors);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [jobs, setJobs] = useState([]);

  const load = useCallback(async () => {
    if (!user?.uid) {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [w, all] = await Promise.all([
        getWeekEarningsForProvider(user.uid),
        getJobsForProvider(user.uid),
      ]);
      setWeekEarnings(w);
      setJobs(all);
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

  const completed = jobs.filter((j) => j.status === 'completed');
  const accepted = jobs.filter((j) => j.status === 'accepted');
  const totalEarned = completed.reduce((s, j) => s + (Number(j.price) || 0), 0);
  const pendingPayout = accepted.reduce((s, j) => s + (Number(j.price) || 0), 0);

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Earnings" allowBackIcon={false} />

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
        ) : (
          <FlatList
            data={completed}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <View>
                <View style={styles.statsRow}>
                  <View style={styles.bigStatCard}>
                    <Text style={styles.bigStatLabel}>This week</Text>
                    <Text style={styles.bigStatValue}>
                      PKR {(weekEarnings / 1000).toFixed(1)}k
                    </Text>
                  </View>
                </View>

                <View style={styles.miniRow}>
                  <View style={styles.miniCard}>
                    <Text style={styles.miniLabel}>Total earned</Text>
                    <Text style={styles.miniValue}>
                      PKR {totalEarned.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.miniCard}>
                    <Text style={styles.miniLabel}>Pending payout</Text>
                    <Text style={styles.miniValue}>
                      PKR {pendingPayout.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Completed jobs</Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons name="cash-outline" size={36} color={colors.textSecondary} />
                <Text style={styles.emptyTitle}>No earnings yet</Text>
                <Text style={styles.emptyHint}>
                  Earnings will show up here once you complete your first job.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.jobRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {item.serviceTitle || 'Service'}
                  </Text>
                  <Text style={styles.jobTaker} numberOfLines={1}>
                    {item.takerName || 'Customer'}
                  </Text>
                </View>
                <Text style={styles.jobPrice}>
                  PKR {(Number(item.price) || 0).toLocaleString()}
                </Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
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

export default function FavouritesOrEarningsScreen() {
  const { role } = useAuth();
  return role === 'provider' ? <ProviderEarnings /> : <TakerFavourites />;
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

    statsRow: {
      flexDirection: 'row',
      marginTop: 12,
      marginBottom: 12,
    },
    bigStatCard: {
      flex: 1,
      backgroundColor: PALETTE.golden,
      borderRadius: 16,
      padding: 18,
    },
    bigStatLabel: {
      ...FONTS.small,
      color: PALETTE.black,
      fontWeight: '600',
      marginBottom: 6,
    },
    bigStatValue: {
      fontSize: 32,
      fontWeight: '800',
      color: PALETTE.black,
    },
    miniRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    miniCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    miniLabel: {
      ...FONTS.small,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    miniValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    sectionLabel: {
      ...FONTS.bodyMedium,
      color: colors.text,
      fontWeight: '700',
      fontSize: 16,
      marginTop: 4,
      marginBottom: 10,
    },
    jobRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    jobTitle: {
      ...FONTS.bodyMedium,
      color: colors.text,
      fontWeight: '600',
    },
    jobTaker: {
      ...FONTS.small,
      color: colors.textSecondary,
      marginTop: 2,
    },
    jobPrice: {
      ...FONTS.bodyMedium,
      color: PALETTE.golden,
      fontWeight: '700',
    },
  });
