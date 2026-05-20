import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/src/components/Header';
import ServiceCard from '@/src/components/ServiceCard';
import { useCategories } from '@/src/hooks/useCategories';
import { getAllProviders } from '@/src/services/providerService';
import { FONTS, PALETTE, useTheme } from '@/src/theme';

const providerCoverImage = (uid) =>
  `https://picsum.photos/seed/${uid || 'provider'}/600/400`;

export default function AllProvidersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { data: categories } = useCategories();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getAllProviders();
      const sorted = items
        .slice()
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setProviders(sorted);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const categoryNameById = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return providers;
    return providers.filter((p) => {
      const name = (p.fullName || '').toLowerCase();
      const bio = (p.bio || '').toLowerCase();
      const areas = (p.serviceAreas || []).join(' ').toLowerCase();
      const cat = (categoryNameById[p.categoryId] || '').toLowerCase();
      return (
        name.includes(q) ||
        bio.includes(q) ||
        areas.includes(q) ||
        cat.includes(q)
      );
    });
  }, [providers, search, categoryNameById]);

  const openProvider = (provider) =>
    router.push({
      pathname: '/provider/[id]',
      params: { id: provider.id },
    });

  return (
    <SafeAreaView style={styles.area} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Header title="All Providers" />

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, area, or category"
            placeholderTextColor={colors.textSecondary}
            returnKeyType="search"
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ paddingVertical: 32 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="people-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No providers found</Text>
            <Text style={styles.emptyHint}>
              {search ? 'Try a different search.' : 'Check back soon.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => {
              const catName = categoryNameById[item.categoryId] || 'Service';
              const subtitle = `${catName} · ★ ${item.rating?.toFixed?.(1) || '—'}`;
              return (
                <ServiceCard
                  itemId={item.id}
                  itemData={item}
                  providerName={item.fullName}
                  eventDateTime={subtitle}
                  image={providerCoverImage(item.id)}
                  location={
                    (item.serviceAreas || []).join(' · ') || 'Pakistan'
                  }
                  onPress={() => openProvider(item)}
                />
              );
            }}
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
    area: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, paddingHorizontal: 16 },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginVertical: 12,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      padding: 0,
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