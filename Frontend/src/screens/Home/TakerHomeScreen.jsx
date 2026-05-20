import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Category from '@/src/components/Category';
import FilterSheet, { SORT_OPTIONS } from '@/src/components/FilterSheet';
import Header from '@/src/components/Header';
import ServiceCard from '@/src/components/ServiceCard';
import SubHeaderItem from '@/src/components/SubHeaderItem';
import { getCategoryById } from '@/src/constants/categories';
import { useAuth } from '@/src/context/AuthContext';
import { useCategories } from '@/src/hooks/useCategories';
import { useFeaturedProviders } from '@/src/hooks/useFeaturedProviders';
import { useServices } from '@/src/hooks/useServices';
import { getUserProfile } from '@/src/services/authService';
import { PALETTE, SIZES, useTheme } from '@/src/theme';
import { makeStyles } from './HomeScreen.styles';

const FALLBACK_AVATAR = 'https://i.pravatar.cc/100?u=madadgar-default';

const providerCoverImage = (uid) =>
  `https://picsum.photos/seed/${uid || 'provider'}/600/400`;

const formatPrice = (service) => {
  if (typeof service?.basePrice !== 'number') return null;
  const price = `PKR ${service.basePrice.toLocaleString()}`;
  return service.priceUnit ? `${price} · ${service.priceUnit}` : price;
};

export default function TakerHomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, role } = useAuth();
  const styles = makeStyles(colors);

  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);
  const [sortBy, setSortBy] = useState('rating');
  const [filterOpen, setFilterOpen] = useState(false);

  const [profile, setProfile] = useState(null);

  const { data: categories } = useCategories();
  const {
    data: featuredProviders,
    loading: provLoading,
    refresh: refreshProviders,
  } = useFeaturedProviders(6);
  const {
    data: services,
    loading: svcLoading,
    refresh: refreshServices,
  } = useServices({
    categoryIds: selectedCategories,
    search,
    priceMin,
    priceMax,
    sortBy,
  });

  useFocusEffect(
    useCallback(() => {
      refreshProviders();
      refreshServices();
    }, [refreshProviders, refreshServices]),
  );

  useEffect(() => {
    let cancelled = false;
    if (!user?.uid || !role) {
      setProfile(null);
      return;
    }
    getUserProfile(user.uid, role)
      .then((data) => !cancelled && setProfile(data))
      .catch(() => { });
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

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const categoryNameById = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  const openProvider = (provider) => {
    router.push({
      pathname: '/provider/[id]',
      params: { id: provider.id },
    });
  };

  const openService = (service) =>
    router.push({
      pathname: '/service/[id]',
      params: { id: service.id },
    });

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

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header
          variant="profileHeader"
          profileHeaderProps={{
            profileImage: avatarUri,
            username: firstName,
            unreadNotificationCount: 0,
            onAvatarPress: () => router.push('/(tabs)/profile'),
          }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search services or providers..."
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
              style={{ marginBottom: 8 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {selectedCategories.map((id) => {
                const c = getCategoryById(id);
                return (
                  <TouchableOpacity
                    key={id}
                    style={styles.activeFilterChip}
                    onPress={() => toggleCategory(id)}
                  >
                    <Text style={styles.activeFilterChipText}>{c.name}</Text>
                    <Ionicons name="close" size={14} color={PALETTE.black} />
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
                  <Ionicons name="close" size={14} color={PALETTE.black} />
                </TouchableOpacity>
              )}
              {sortBy !== 'rating' && (
                <TouchableOpacity
                  style={styles.activeFilterChip}
                  onPress={() => setSortBy('rating')}
                >
                  <Text style={styles.activeFilterChipText}>{activeSortLabel}</Text>
                  <Ionicons name="close" size={14} color={PALETTE.black} />
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

          <SubHeaderItem
            title="Featured Providers"
            navTitle="See all"
            onPress={() => router.push('/providers')}
          />
          {provLoading ? (
            <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
          ) : featuredProviders.length === 0 ? (
            <Text style={styles.emptyText}>
              No providers yet. Sign up as a provider and publish a service to see them here.
            </Text>
          ) : (
            <View style={styles.serviceSlider}>
              <FlatList
                data={featuredProviders}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                snapToInterval={SIZES.width / 2 + 15}
                decelerationRate="fast"
                renderItem={({ item }) => {
                  const catName = categoryNameById[item.categoryId] || 'Service';
                  const subtitle = `${catName} · ★ ${item.rating?.toFixed?.(1) || '—'}`;
                  return (
                    <View style={styles.cardWrapper}>
                      <ServiceCard
                        itemId={item.id}
                        itemData={item}
                        providerName={item.fullName}
                        eventDateTime={subtitle}
                        image={providerCoverImage(item.id)}
                        location={(item.serviceAreas || []).join(' · ') || 'Pakistan'}
                        fullWidth
                        onPress={() => openProvider(item)}
                      />
                    </View>
                  );
                }}
              />
            </View>
          )}

          <SubHeaderItem title="Categories" navTitle="See all" />
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            numColumns={4}
            scrollEnabled={false}
            extraData={selectedCategories}
            renderItem={({ item }) => (
              <Category
                name={item.name}
                icon={item.icon}
                iconColor={item.iconColor}
                backgroundColor={item.backgroundColor}
                active={selectedCategories.includes(item.id)}
                onPress={() => toggleCategory(item.id)}
              />
            )}
          />

          <View style={styles.section}>
            {/* <View style={styles.resultsHeader}> */}
              <SubHeaderItem
                title={selectedCategories.length === 1 ? `${getCategoryById(selectedCategories[0]).name} Services` : 'Popular Services Near You'}
                navTitle="See all"
                onPress={() => router.push('/services')}
              />
            {/* </View> */}

            {svcLoading ? (
              <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
            ) : services.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="search-outline" size={32} color={colors.textSecondary} />
                <Text style={styles.emptyText}>
                  {hasActiveFilters || search
                    ? 'No services match these filters.'
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
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ServiceCard
                    itemId={item.id}
                    itemData={item}
                    providerName={item.title}
                    eventDateTime={formatPrice(item) || `★ ${item.rating?.toFixed?.(1) || '—'}`}
                    image={item.image}
                    location={item.location}
                    onPress={() => openService(item)}
                  />
                )}
              />
            )}
          </View>
        </ScrollView>
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
