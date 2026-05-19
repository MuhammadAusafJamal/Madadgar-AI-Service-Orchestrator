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
import Header from '@/src/components/Header';
import ServiceCard from '@/src/components/ServiceCard';
import SubHeaderItem from '@/src/components/SubHeaderItem';
import { useAuth } from '@/src/context/AuthContext';
import { useCategories } from '@/src/hooks/useCategories';
import { useFeaturedProviders } from '@/src/hooks/useFeaturedProviders';
import { useServices } from '@/src/hooks/useServices';
import { getUserProfile } from '@/src/services/authService';
import { SIZES, useTheme } from '@/src/theme';
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
  const [profile, setProfile] = useState(null);

  const { data: categories, loading: catsLoading } = useCategories();
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search services or providers..."
              placeholderTextColor={colors.textSecondary}
            />
            <Ionicons name="options-outline" size={20} color={colors.text} />
          </View>

          <SubHeaderItem title="Featured Providers" navTitle="See all" />
          {provLoading ? (
            <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
          ) : featuredProviders.length === 0 ? (
            <Text style={styles.emptyText}>
              No providers yet — open Profile and tap "Reseed Demo Data".
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
          {catsLoading ? (
            <ActivityIndicator color={colors.accent} style={{ paddingVertical: 16 }} />
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              numColumns={4}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Category
                  name={item.name}
                  icon={item.icon}
                  iconColor={item.iconColor}
                  backgroundColor={item.backgroundColor}
                />
              )}
            />
          )}

          <View style={styles.section}>
            <SubHeaderItem title="Popular Services Near You" navTitle="See all" />
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const active = selectedCategories.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => toggleCategory(item.id)}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            {svcLoading ? (
              <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
            ) : services.length === 0 ? (
              <Text style={styles.emptyText}>No services match your filters.</Text>
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
    </SafeAreaView>
  );
}
