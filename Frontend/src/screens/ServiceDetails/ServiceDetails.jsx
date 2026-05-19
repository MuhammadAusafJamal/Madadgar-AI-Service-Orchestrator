import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
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
import { PALETTE, useTheme } from '@/src/theme';
import { makeStyles } from './ServiceDetails.styles';

const TABS = [
  { key: 'details', title: 'Details' },
  { key: 'reviews', title: 'Reviews' },
  { key: 'guests', title: 'Influencers' },
];

const STATIC_DETAILS = {
  description:
    'An exclusive night for tastemakers and founders. Curated guest list, signature cocktails, live acoustic sets, and intimate conversations under the city lights. Dress code: smart casual.',
  highlights: [
    'Welcome cocktail',
    'Live acoustic sets',
    'Curated guest list',
    'Late-night dinner',
  ],
  organizer: {
    name: 'CreateGroup × VIPLISTA',
    tagline: 'Luxury experiences for modern brands',
    avatar: 'https://i.pravatar.cc/100?u=organizer',
  },
};

const STATIC_REVIEWS = [
  {
    id: 'r1',
    name: 'Sara Khan',
    avatar: 'https://i.pravatar.cc/100?u=sara',
    stars: 5,
    text: 'One of the best events I have attended this year. Crowd was incredible.',
  },
  {
    id: 'r2',
    name: 'Ali Raza',
    avatar: 'https://i.pravatar.cc/100?u=ali',
    stars: 4,
    text: 'Loved the venue and the live music. Could have used more food options though.',
  },
  {
    id: 'r3',
    name: 'Hina Tariq',
    avatar: 'https://i.pravatar.cc/100?u=hina',
    stars: 5,
    text: 'Perfectly curated. Met so many founders and creators. Already booked next month.',
  },
];

const STATIC_INFLUENCERS = [
  { id: 'i1', name: 'Zara M.', avatar: 'https://i.pravatar.cc/100?u=zara', followers: '124k' },
  { id: 'i2', name: 'Bilal A.', avatar: 'https://i.pravatar.cc/100?u=bilal', followers: '88k' },
  { id: 'i3', name: 'Mehak S.', avatar: 'https://i.pravatar.cc/100?u=mehak', followers: '215k' },
  { id: 'i4', name: 'Hassan K.', avatar: 'https://i.pravatar.cc/100?u=hassan', followers: '47k' },
  { id: 'i5', name: 'Anum R.', avatar: 'https://i.pravatar.cc/100?u=anum', followers: '301k' },
  { id: 'i6', name: 'Faraz J.', avatar: 'https://i.pravatar.cc/100?u=faraz', followers: '62k' },
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

const DetailsTab = ({ styles }) => (
  <View>
    <Text style={styles.sectionLabel}>About this event</Text>
    <Text style={styles.bodyText}>{STATIC_DETAILS.description}</Text>

    <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Highlights</Text>
    <View style={styles.chipRow}>
      {STATIC_DETAILS.highlights.map((h) => (
        <View key={h} style={styles.chip}>
          <Text style={styles.chipText}>{h}</Text>
        </View>
      ))}
    </View>

    <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Organizer</Text>
    <View style={styles.organizerRow}>
      <Image source={{ uri: STATIC_DETAILS.organizer.avatar }} style={styles.organizerAvatar} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={styles.organizerName}>{STATIC_DETAILS.organizer.name}</Text>
        <Text style={styles.organizerTagline}>{STATIC_DETAILS.organizer.tagline}</Text>
      </View>
      <TouchableOpacity style={styles.followBtn}>
        <Text style={styles.followBtnText}>Follow</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const ReviewsTab = ({ styles }) => (
  <View>
    <View style={styles.ratingSummary}>
      <Text style={styles.ratingNumber}>4.7</Text>
      <View style={{ marginLeft: 12 }}>
        <Stars count={5} />
        <Text style={styles.ratingCount}>Based on 124 reviews</Text>
      </View>
    </View>

    {STATIC_REVIEWS.map((r) => (
      <View key={r.id} style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Image source={{ uri: r.avatar }} style={styles.reviewAvatar} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.reviewName}>{r.name}</Text>
            <Stars count={r.stars} />
          </View>
        </View>
        <Text style={styles.reviewText}>{r.text}</Text>
      </View>
    ))}
  </View>
);

const GuestsTab = ({ styles }) => (
  <View>
    <Text style={styles.sectionLabel}>Confirmed Influencers</Text>
    <View style={styles.guestGrid}>
      {STATIC_INFLUENCERS.map((g) => (
        <View key={g.id} style={styles.guestCard}>
          <Image source={{ uri: g.avatar }} style={styles.guestAvatar} />
          <Text style={styles.guestName}>{g.name}</Text>
          <Text style={styles.guestFollowers}>{g.followers} followers</Text>
        </View>
      ))}
    </View>
  </View>
);

export default function ServiceDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const event = {
    eventName: params.eventName || 'Sample Event',
    eventDateTime: params.eventDateTime || 'Fri, Dec 20 — 12:00 - 15:00',
    location: params.location || 'Green Park, New York',
    image: params.image || 'https://picsum.photos/seed/fallback/800/600',
  };

  const [tab, setTab] = useState('details');
  const [bookingVisible, setBookingVisible] = useState(false);

  const bookingPayload = {
    title: 'Booking Request Sent',
    provider: STATIC_DETAILS.organizer.name,
    subtitle: `Your request has been sent to ${STATIC_DETAILS.organizer.name}. They will review your request and reply shortly in chat.`,
    dateLabel: event.eventDateTime,
    serviceLabel: event.eventName,
    locationLabel: event.location,
  };

  const renderTabContent = () => {
    switch (tab) {
      case 'details':
        return <DetailsTab styles={styles} />;
      case 'reviews':
        return <ReviewsTab styles={styles} />;
      case 'guests':
        return <GuestsTab styles={styles} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.area} edges={['top']}>
      <Header
        title="Event Details"
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
          source={{ uri: event.image }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlayBGImg} />
          <View style={styles.cardContainer}>
            <View style={styles.contentContainer}>
              <Text style={styles.fullName} numberOfLines={2}>
                {event.eventName}
              </Text>
              <Text style={styles.dateText}>{event.eventDateTime}</Text>
              <View style={styles.locationContainer}>
                <FontAwesome name="map-marker" size={14} color={PALETTE.golden} />
                <Text style={styles.locationText} numberOfLines={2}>
                  {event.location}
                </Text>
              </View>
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

        <TouchableOpacity style={styles.cta} onPress={() => setBookingVisible(true)}>
          <Text style={styles.ctaText}>Reserve Spot</Text>
        </TouchableOpacity>
      </ScrollView>

      <BookingConfirmationFlow
        visible={bookingVisible}
        onClose={() => setBookingVisible(false)}
        onViewBooking={() => {
          setBookingVisible(false);
          router.push('/(tabs)/bookings');
        }}
        booking={bookingPayload}
      />
    </SafeAreaView>
  );
}
