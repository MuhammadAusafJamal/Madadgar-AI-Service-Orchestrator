import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FilterSheet, { SORT_OPTIONS } from '@/src/components/FilterSheet';
import Header from '@/src/components/Header';
import ServiceCard from '@/src/components/ServiceCard';
import { getCategoryById } from '@/src/constants/categories';
import { useServices } from '@/src/hooks/useServices';
import { FONTS, PALETTE, useTheme } from '@/src/theme';

const formatPrice = (item) => {
  if (typeof item?.basePrice !== 'number') return '';
  const price = `PKR ${item.basePrice.toLocaleString()}`;
  return item.priceUnit ? `${price} · ${item.priceUnit}` : price;
};

export default function AllServicesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);
  const [sortBy, setSortBy] = useState('rating');
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: services,
    loading,
    refresh,
  } = useServices({
    categoryIds: selectedCategories,
    search,
    priceMin,
    priceMax,
    sortBy,
    max: 100,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleApplyFilters = ({
    categoryIds,
    priceMin: pMin,
    priceMax: pMax,
    sortBy: sb,
  }) => {
    setSelectedCategories(categoryIds || []);
    setPriceMin(pMin);
    setPriceMax(pMax);
    setSortBy(sb || 'rating');
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceMin(null);
    setPriceMax(null);
    setSortBy('rating');
    setSearch('');
  };

  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Top rated';

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    priceMin !== null ||
    priceMax !== null ||
    sortBy !== 'rating';

  const openService = (service) =>
    router.push({
      pathname: '/service/[id]',
      params: { id: service.id },
    });

  const headerCount = useMemo(
    () => `${services.length} result${services.length === 1 ? '' : 's'}`,
    [services.length],
  );

  return (
    <SafeAreaView style={styles.area} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Header title="All Services" />

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search services..."
            placeholderTextColor={colors.textSecondary}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={() => setFilterOpen(true)} hitSlop={10}>
            <View style={styles.filterIconWrap}>
              <Ionicons name="options-outline" size={20} color={colors.text} />
              {hasActiveFilters && <View style={styles.filterDot} />}
            </View>
          </TouchableOpacity>
        </View>

        {hasActiveFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.activeFiltersRow}
            contentContainerStyle={styles.activeFiltersContent}
          >
            {selectedCategories.map((id) => {
              const c = getCategoryById(id);
              return (
                <TouchableOpacity
                  key={`cat-${id}`}
                  style={styles.activeFilterChip}
                  onPress={() =>
                    setSelectedCategories((prev) => prev.filter((x) => x !== id))
                  }
                >
                  <Text style={styles.activeFilterChipText}>{c?.name || id}</Text>
                  <Ionicons name="close" size={12} color={PALETTE.black} />
                </TouchableOpacity>
              );
            })}

            {(priceMin !== null || priceMax !== null) && (
              <TouchableOpacity
                style={styles.activeFilterChip}
                onPress={() => {
                  setPriceMin(null);
                  setPriceMax(null);
                }}
              >
                <Text style={styles.activeFilterChipText}>
                  PKR {priceMin ?? '0'}–{priceMax ?? '∞'}
                </Text>
                <Ionicons name="close" size={12} color={PALETTE.black} />
              </TouchableOpacity>
            )}

            {sortBy !== 'rating' && (
              <TouchableOpacity
                style={styles.activeFilterChip}
                onPress={() => setSortBy('rating')}
              >
                <Text style={styles.activeFilterChipText}>{activeSortLabel}</Text>
                <Ionicons name="close" size={12} color={PALETTE.black} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.clearAllChip}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearAllChipText}>Clear all</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        <Text style={styles.resultCount}>{headerCount}</Text>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ paddingVertical: 32 }} />
        ) : services.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No services found</Text>
            <Text style={styles.emptyHint}>
              {hasActiveFilters || search
                ? 'Try removing filters or a different search.'
                : 'No services published yet.'}
            </Text>
            {(hasActiveFilters || search) && (
              <TouchableOpacity onPress={clearAllFilters}>
                <Text style={styles.emptyAction}>Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={services}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ServiceCard
                itemId={item.id}
                itemData={item}
                providerName={item.title}
                eventDateTime={
                  formatPrice(item) || `★ ${item.rating?.toFixed?.(1) || '—'}`
                }
                image={item.image}
                location={item.location}
                onPress={() => openService(item)}
              />
            )}
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

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilters}
        initial={{
          categoryIds: selectedCategories,
          priceMin,
          priceMax,
          sortBy,
        }}
      />
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
    filterIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterDot: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: PALETTE.golden,
    },
    activeFiltersRow: {
      flexGrow: 0,
      marginBottom: 8,
    },
    activeFiltersContent: {
      gap: 6,
      alignItems: 'center',
      paddingVertical: 2,
    },
    activeFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: PALETTE.golden,
    },
    activeFilterChipText: {
      color: PALETTE.black,
      fontSize: 11,
      fontWeight: '700',
    },
    clearAllChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearAllChipText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: '600',
    },
    resultCount: {
      ...FONTS.small,
      color: colors.textSecondary,
      marginBottom: 8,
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
    emptyAction: {
      ...FONTS.bodyMedium,
      color: PALETTE.golden,
      fontWeight: '700',
      marginTop: 6,
    },
  });