import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ServiceCard from '@/src/components/ServiceCard';
import { getCategoryById } from '@/src/constants/categories';
import { useAuth } from '@/src/context/AuthContext';
import { useProviderProfile } from '@/src/hooks/useProviderProfile';
import { peerChatSessionId } from '@/src/services/peerChatService';
import { FONTS, PALETTE, SIZES, useTheme } from '@/src/theme';

const formatPrice = (item) => {
  if (typeof item?.basePrice !== 'number') return '';
  const price = `PKR ${item.basePrice.toLocaleString()}`;
  return item.priceUnit ? `${price} · ${item.priceUnit}` : price;
};

const Stars = ({ count }) => (
  <View style={{ flexDirection: 'row' }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <FontAwesome
        key={i}
        name={i < count ? 'star' : 'star-o'}
        size={12}
        color={PALETTE.golden}
        style={{ marginRight: 2 }}
      />
    ))}
  </View>
);

export default function ProviderProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = makeStyles(colors);

  const providerId = params.id;
  const { provider, services, reviews, loading } = useProviderProfile(providerId);

  if (loading) {
    return (
      <SafeAreaView style={styles.area} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!provider) {
    return (
      <SafeAreaView style={styles.area} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Provider</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Provider not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const category = getCategoryById(provider.categoryId);
  const coverImage = `https://picsum.photos/seed/${provider.id}-cover/800/400`;
  const isSelf = user?.uid === provider.id;

  const handleChat = () => {
    if (isSelf) return;
    const sessionId = peerChatSessionId(user?.uid || 'guest', provider.id);
    router.push({
      pathname: '/chat/[sessionId]',
      params: {
        sessionId,
        peerId: provider.id,
        peerName: provider.fullName,
        peerAvatar: provider.profilePic,
      },
    });
  };

  const openService = (svc) =>
    router.push({
      pathname: '/service/[id]',
      params: { id: svc.id },
    });

  return (
    <SafeAreaView style={styles.area} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <ImageBackground source={{ uri: coverImage }} style={styles.cover} resizeMode="cover">
          <View style={styles.coverOverlay} />
          <View style={styles.coverHeader}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={26} color={PALETTE.white} />
            </TouchableOpacity>
            {provider.verified && (
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={14} color={PALETTE.golden} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </ImageBackground>

        <View style={styles.headerCard}>
          <Image
            source={{
              uri: provider.profilePic || `https://i.pravatar.cc/200?u=${provider.id}`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{provider.fullName}</Text>

          {!!category && (
            <View style={[styles.categoryPill, { backgroundColor: category.backgroundColor }]}>
              <Ionicons name={category.icon} size={14} color={category.iconColor} />
              <Text style={[styles.categoryText, { color: category.iconColor }]}>
                {category.name}
              </Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Stars count={Math.round(provider.rating || 0)} />
              <Text style={styles.metaLabel}>
                {provider.rating ? provider.rating.toFixed(1) : '—'} ({provider.reviewCount || 0})
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaLabel}>{provider.completedJobs || 0} jobs</Text>
            </View>
            {Array.isArray(provider.serviceAreas) && provider.serviceAreas.length > 0 && (
              <>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaLabel}>
                    {provider.serviceAreas[0]}
                    {provider.serviceAreas.length > 1
                      ? ` +${provider.serviceAreas.length - 1}`
                      : ''}
                  </Text>
                </View>
              </>
            )}
          </View>

          {!isSelf && (
            <View style={styles.ctaRow}>
              <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
                <Ionicons name="chatbubbles-outline" size={18} color={PALETTE.golden} />
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
              {services[0] && (
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => openService(services[0])}
                >
                  <Text style={styles.bookBtnText}>View Top Service</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bodyText}>
            {provider.bio || 'No bio added yet.'}
          </Text>
        </View>

        {Array.isArray(provider.serviceAreas) && provider.serviceAreas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service areas</Text>
            <View style={styles.chipRow}>
              {provider.serviceAreas.map((a) => (
                <View key={a} style={styles.chip}>
                  <Text style={styles.chipText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Services ({services.length})
          </Text>
          {services.length === 0 ? (
            <Text style={styles.emptyHint}>
              {isSelf
                ? 'You haven\'t published any services yet. Tap "+ Create Service" on home.'
                : 'This provider has not listed any services yet.'}
            </Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Reviews ({reviews.length})
          </Text>
          {reviews.length === 0 ? (
            <Text style={styles.emptyHint}>No reviews yet.</Text>
          ) : (
            reviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: r.takerAvatar }} style={styles.reviewAvatar} />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.reviewName}>{r.takerName}</Text>
                    <Stars count={r.stars || 0} />
                  </View>
                </View>
                <Text style={styles.reviewText}>{r.text}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    area: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    headerTitle: {
      ...FONTS.bodyMedium,
      color: colors.text,
      fontWeight: '700',
    },
    cover: {
      height: 180,
      width: '100%',
    },
    coverOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    coverHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 14,
    },
    verifiedPill: {
      flexDirection: 'row',
      gap: 4,
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderColor: PALETTE.golden,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    verifiedText: {
      color: PALETTE.golden,
      fontSize: 12,
      fontWeight: '700',
    },
    headerCard: {
      marginHorizontal: 16,
      marginTop: -50,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      alignItems: 'center',
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      borderWidth: 3,
      borderColor: colors.surface,
      marginTop: -50,
    },
    name: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginTop: 10,
    },
    categoryPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      marginTop: 8,
    },
    categoryText: {
      ...FONTS.small,
      fontWeight: '700',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
      marginTop: 14,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaLabel: {
      ...FONTS.small,
      color: colors.textSecondary,
    },
    metaDivider: {
      width: 1,
      height: 14,
      backgroundColor: colors.border,
    },
    ctaRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
      width: '100%',
    },
    chatBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 22,
      borderWidth: 1.4,
      borderColor: PALETTE.golden,
    },
    chatBtnText: {
      color: PALETTE.golden,
      fontWeight: '700',
    },
    bookBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 22,
      backgroundColor: PALETTE.golden,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bookBtnText: {
      color: PALETTE.black,
      fontWeight: '700',
    },
    section: {
      paddingHorizontal: 16,
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },
    bodyText: {
      ...FONTS.body,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    emptyHint: {
      ...FONTS.body,
      color: colors.textSecondary,
      paddingVertical: 8,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipText: {
      color: colors.text,
      fontSize: 13,
    },
    reviewCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 10,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    reviewAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    reviewName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },
    reviewText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
  });
