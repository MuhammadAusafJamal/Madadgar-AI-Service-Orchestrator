import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BookingConfirmationFlow from '@/src/components/BookingConfirmationFlow';
import Header from '@/src/components/Header';
import { useAuth } from '@/src/context/AuthContext';
import { useServiceDetail } from '@/src/hooks/useServiceDetail';
import { saveBookingForUser } from '@/src/services/bookingService';
import { peerChatSessionId } from '@/src/services/peerChatService';
import { PALETTE, useTheme } from '@/src/theme';
import { makeStyles } from './ServiceDetails.styles';

const TABS = [
  { key: 'details', title: 'Details' },
  { key: 'reviews', title: 'Reviews' },
  { key: 'provider', title: 'Provider' },
];

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

const formatScheduleLabel = (service) => {
  if (!service) return 'Schedule TBD';
  const price = typeof service.basePrice === 'number'
    ? `PKR ${service.basePrice.toLocaleString()}${service.priceUnit ? ` / ${service.priceUnit}` : ''}`
    : null;
  return [price, service.duration].filter(Boolean).join(' • ');
};

const DetailsTab = ({ styles, service, provider }) => (
  <View>
    <Text style={styles.sectionLabel}>About this service</Text>
    <Text style={styles.bodyText}>
      {service?.description || 'No description provided.'}
    </Text>

    {Array.isArray(service?.highlights) && service.highlights.length > 0 && (
      <>
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Highlights</Text>
        <View style={styles.chipRow}>
          {service.highlights.map((h) => (
            <View key={h} style={styles.chip}>
              <Text style={styles.chipText}>{h}</Text>
            </View>
          ))}
        </View>
      </>
    )}

    {provider && (
      <>
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Provider</Text>
        <View style={styles.organizerRow}>
          <Image
            source={{
              uri: provider.profilePic || 'https://i.pravatar.cc/100?u=provider',
            }}
            style={styles.organizerAvatar}
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.organizerName}>{provider.fullName}</Text>
            <Text style={styles.organizerTagline} numberOfLines={2}>
              {provider.bio}
            </Text>
            {!!provider.email && (
              <View style={styles.providerContactRow}>
                <Ionicons name="mail-outline" size={12} color={PALETTE.golden} />
                <Text style={styles.providerContactText} numberOfLines={1}>
                  {provider.email}
                </Text>
              </View>
            )}
          </View>
        </View>
      </>
    )}
  </View>
);

const ReviewsTab = ({ styles, reviews, service }) => {
  const avg = service?.rating || 0;
  const count = service?.reviewCount || reviews.length;
  const roundedStars = Math.round(avg);
  return (
    <View>
      <View style={styles.ratingSummary}>
        <Text style={styles.ratingNumber}>
          {avg ? avg.toFixed(1) : '—'}
        </Text>
        <View style={{ marginLeft: 12 }}>
          <Stars count={roundedStars} />
          <Text style={styles.ratingCount}>
            Based on {count} review{count === 1 ? '' : 's'}
          </Text>
        </View>
      </View>

      {reviews.length === 0 ? (
        <Text style={[styles.bodyText, { paddingVertical: 12 }]}>
          No reviews yet for this service.
        </Text>
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
  );
};

const ProviderTab = ({ styles, provider, onViewProfile }) => {
  if (!provider) {
    return (
      <Text style={[styles.bodyText, { paddingVertical: 12 }]}>
        Provider information unavailable.
      </Text>
    );
  }
  return (
    <View>
      <TouchableOpacity onPress={onViewProfile} activeOpacity={0.85} style={styles.organizerRow}>
        <Image
          source={{
            uri: provider.profilePic || 'https://i.pravatar.cc/100?u=provider',
          }}
          style={styles.organizerAvatar}
        />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.organizerName}>{provider.fullName}</Text>
          <Text style={styles.organizerTagline}>
            ★ {provider.rating?.toFixed?.(1) || '—'} · {provider.completedJobs || 0} completed jobs
          </Text>
        </View>
        <TouchableOpacity style={styles.followBtn} onPress={onViewProfile}>
          <Text style={styles.followBtnText}>View Profile</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <Text style={[styles.sectionLabel, { marginTop: 24 }]}>About</Text>
      <Text style={styles.bodyText}>{provider.bio || 'No bio provided.'}</Text>

      {Array.isArray(provider.serviceAreas) && provider.serviceAreas.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Service areas</Text>
          <View style={styles.chipRow}>
            {provider.serviceAreas.map((a) => (
              <View key={a} style={styles.chip}>
                <Text style={styles.chipText}>{a}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {!!provider.phone && (
        <>
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Contact</Text>
          <Text style={styles.bodyText}>{provider.phone}</Text>
        </>
      )}
    </View>
  );
};

export default function ServiceDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = makeStyles(colors);

  const serviceId = params.id;
  const prefillLocation = typeof params.prefillLocation === 'string' ? params.prefillLocation : '';
  const prefillTime = typeof params.prefillTime === 'string' ? params.prefillTime : '';
  const autoBook = params.autoBook === 'true';
  const { service, provider, reviews, loading } = useServiceDetail(serviceId);

  const [tab, setTab] = useState('details');
  const [bookingVisible, setBookingVisible] = useState(false);
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    if (autoBook && service && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      setBookingVisible(true);
    }
  }, [autoBook, service]);

  const fallbackImage = useMemo(
    () => `https://picsum.photos/seed/${serviceId || 'service'}/800/600`,
    [serviceId],
  );

  const scheduleLabel = formatScheduleLabel(service);

  const bookingPayload = service && provider
    ? {
        title: 'Booking Request Sent',
        provider: provider.fullName,
        subtitle: `Your request has been sent to ${provider.fullName}. They will review and reply shortly in chat.`,
        dateLabel: scheduleLabel,
        serviceLabel: service.title,
        locationLabel: service.location,
      }
    : null;

  const handleBookingPress = () => {
    setBookingVisible(true);
  };

  const handleBookingSubmit = (formData) => {
    if (!service || !provider || !user?.uid) return;
    saveBookingForUser(user.uid, {
      providerId: provider.id,
      providerName: provider.fullName,
      providerEmail: provider.email || null,
      serviceId: service.id,
      serviceTitle: service.title,
      status: 'pending',
      price: service.basePrice,
      takerName: user.displayName || null,
      takerEmail: user.email || null,
      location: formData?.location || service.location,
      scheduledFor: formData?.scheduledAt
        ? formData.scheduledAt.toISOString()
        : null,
      preferredDate: formData?.dateLabel || null,
      preferredTime: formData?.timeSlot || null,
      reason: formData?.reason || null,
    }).catch(() => {});
  };

  const handleChatPress = () => {
    if (!provider) return;
    const peerId = provider.id;
    const sessionId = peerChatSessionId(user?.uid || 'guest', peerId);
    router.push({
      pathname: '/chat/[sessionId]',
      params: {
        sessionId,
        peerId,
        peerName: provider.fullName,
        peerAvatar: provider.profilePic,
        serviceLabel: service?.title,
      },
    });
  };

  const renderTabContent = () => {
    if (loading) {
      return <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />;
    }
    switch (tab) {
      case 'details':
        return <DetailsTab styles={styles} service={service} provider={provider} />;
      case 'reviews':
        return <ReviewsTab styles={styles} reviews={reviews} service={service} />;
      case 'provider':
        return (
          <ProviderTab
            styles={styles}
            provider={provider}
            onViewProfile={() =>
              provider &&
              router.push({
                pathname: '/provider/[id]',
                params: { id: provider.id },
              })
            }
          />
        );
      default:
        return null;
    }
  };

  const headerImage = service?.image || fallbackImage;
  const title = service?.title || 'Service';
  const location = service?.location || '';

  return (
    <SafeAreaView style={styles.area} edges={['top']}>
      <Header
        title="Service Details"
        customStyles={styles.headerOverride}
        customTextStyles={styles.headerTitleOverride}
        iconColor={PALETTE.white}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={{ uri: headerImage }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlayBGImg} />
          <View style={styles.cardContainer}>
            <View style={styles.contentContainer}>
              <Text style={styles.fullName} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.dateText}>{scheduleLabel}</Text>
              {!!location && (
                <View style={styles.locationContainer}>
                  <FontAwesome name="map-marker" size={14} color={PALETTE.golden} />
                  <Text style={styles.locationText} numberOfLines={2}>
                    {location}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.buttonActionRight}>
              <Ionicons name="calendar-outline" size={20} color={PALETTE.golden} />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <View style={styles.tabBar}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <TouchableOpacity key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.title}</Text>
                {active && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.tabContent}>{renderTabContent()}</View>

        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={styles.ctaSecondary}
            onPress={handleChatPress}
            disabled={!provider}
          >
            <Ionicons name="chatbubbles-outline" size={18} color={PALETTE.golden} />
            <Text style={styles.ctaSecondaryText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctaPrimary}
            onPress={handleBookingPress}
            disabled={!service}
          >
            <Text style={styles.ctaText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {bookingPayload && (
        <BookingConfirmationFlow
          visible={bookingVisible}
          onClose={() => setBookingVisible(false)}
          onSubmit={handleBookingSubmit}
          onViewBooking={() => {
            setBookingVisible(false);
            router.push('/(tabs)/bookings');
          }}
          booking={bookingPayload}
          defaultLocation={prefillLocation || service?.location || ''}
          defaultTimeText={prefillTime}
        />
      )}
    </SafeAreaView>
  );
}
