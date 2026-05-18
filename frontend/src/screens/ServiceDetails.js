import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ImageBackground,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { ThemeContext } from '../theme/ThemeProvider';
import { darkColors } from '../theme/colors';

const FORCED_DARK_THEME = {
    dark: true,
    colors: darkColors,
    setScheme: () => {},
};

const SURFACE = '#0F0F0F';
const CARD = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED_TEXT = '#9CA3AF';

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
        text: 'One of the best events I’ve attended this year. Crowd was incredible.',
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
    { id: 'i1', name: 'Zara M.',   avatar: 'https://i.pravatar.cc/100?u=zara',   followers: '124k' },
    { id: 'i2', name: 'Bilal A.',  avatar: 'https://i.pravatar.cc/100?u=bilal',  followers: '88k'  },
    { id: 'i3', name: 'Mehak S.',  avatar: 'https://i.pravatar.cc/100?u=mehak',  followers: '215k' },
    { id: 'i4', name: 'Hassan K.', avatar: 'https://i.pravatar.cc/100?u=hassan', followers: '47k'  },
    { id: 'i5', name: 'Anum R.',   avatar: 'https://i.pravatar.cc/100?u=anum',   followers: '301k' },
    { id: 'i6', name: 'Faraz J.',  avatar: 'https://i.pravatar.cc/100?u=faraz',  followers: '62k'  },
];

const Stars = ({ count }) => (
    <View style={{ flexDirection: 'row' }}>
        {Array.from({ length: 5 }).map((_, i) => (
            <FontAwesome
                key={i}
                name={i < count ? 'star' : 'star-o'}
                size={12}
                color={COLORS.golden}
                style={{ marginRight: 2 }}
            />
        ))}
    </View>
);

const DetailsTab = () => (
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

const ReviewsTab = () => (
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

const GuestsTab = () => (
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

const ServiceDetails = ({ route, navigation }) => {
    const event = route?.params?.event || {
        eventName: 'Sample Event',
        eventDateTime: 'Fri, Dec 20 — 12:00 - 15:00',
        location: 'Green Park, New York',
        image: 'https://picsum.photos/seed/fallback/800/600',
    };

    const [tab, setTab] = useState('details');

    const renderTabContent = () => {
        switch (tab) {
            case 'details': return <DetailsTab />;
            case 'reviews': return <ReviewsTab />;
            case 'guests':  return <GuestsTab />;
            default:        return null;
        }
    };

    return (
        <ThemeContext.Provider value={FORCED_DARK_THEME}>
            <SafeAreaView style={styles.area} edges={['top']}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack?.()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="chevron-back" size={26} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Event Details</Text>
                    <View style={{ width: 26 }} />
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    <ImageBackground
                        source={
                            typeof event.image === 'string'
                                ? { uri: event.image }
                                : event.image
                        }
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
                                    <FontAwesome name="map-marker" size={14} color={COLORS.golden} />
                                    <Text style={styles.locationText} numberOfLines={2}>
                                        {event.location}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.buttonActionRight}>
                                <Ionicons name="calendar-outline" size={20} color={COLORS.golden} />
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>

                    {/* Tab bar */}
                    <View style={styles.tabBar}>
                        {TABS.map((t) => {
                            const active = tab === t.key;
                            return (
                                <TouchableOpacity
                                    key={t.key}
                                    style={styles.tab}
                                    onPress={() => setTab(t.key)}
                                >
                                    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                                        {t.title}
                                    </Text>
                                    {active && <View style={styles.tabIndicator} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Tab content */}
                    <View style={styles.tabContent}>{renderTabContent()}</View>

                    {/* Primary CTA */}
                    <TouchableOpacity style={styles.cta}>
                        <Text style={styles.ctaText}>Reserve Spot</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </ThemeContext.Provider>
    );
};

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: SURFACE,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: SURFACE,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'coldiac',
        color: COLORS.white,
    },
    backgroundImage: {
        height: 320,
        position: 'relative',
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    overlayBGImg: {
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    cardContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        padding: 14,
        gap: 10,
        backgroundColor: 'rgba(0, 109, 91, 0.75)',
    },
    contentContainer: {
        flex: 1,
    },
    fullName: {
        fontSize: 18,
        fontFamily: 'bold',
        color: COLORS.white,
        marginBottom: 6,
    },
    dateText: {
        marginBottom: 8,
        color: COLORS.golden,
        fontSize: 13,
        fontWeight: '600',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        fontSize: 13,
        color: COLORS.white,
        maxWidth: '90%',
    },
    buttonActionRight: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.4,
        borderColor: COLORS.golden,
        alignItems: 'center',
        justifyContent: 'center',
    },

    tabBar: {
        flexDirection: 'row',
        marginTop: 24,
        marginHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabLabel: {
        fontSize: 15,
        color: MUTED_TEXT,
        fontFamily: 'semiBold',
    },
    tabLabelActive: {
        color: COLORS.golden,
        fontWeight: '700',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: -1,
        height: 2,
        width: '60%',
        backgroundColor: COLORS.golden,
        borderRadius: 1,
    },
    tabContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },

    sectionLabel: {
        color: COLORS.white,
        fontSize: 15,
        fontFamily: 'semiBold',
        marginBottom: 10,
    },
    bodyText: {
        color: '#D1D5DB',
        fontSize: 14,
        lineHeight: 22,
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
        borderColor: BORDER,
        backgroundColor: CARD,
    },
    chipText: {
        color: COLORS.white,
        fontSize: 13,
    },
    organizerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CARD,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER,
    },
    organizerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    organizerName: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '700',
    },
    organizerTagline: {
        color: MUTED_TEXT,
        fontSize: 12,
        marginTop: 2,
    },
    followBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.golden,
    },
    followBtnText: {
        color: COLORS.golden,
        fontWeight: '700',
        fontSize: 13,
    },

    ratingSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CARD,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER,
        marginBottom: 16,
    },
    ratingNumber: {
        color: COLORS.white,
        fontSize: 32,
        fontWeight: '800',
    },
    ratingCount: {
        color: MUTED_TEXT,
        fontSize: 12,
        marginTop: 4,
    },
    reviewCard: {
        backgroundColor: CARD,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER,
        padding: 12,
        marginBottom: 12,
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
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    reviewText: {
        color: '#D1D5DB',
        fontSize: 13,
        lineHeight: 19,
    },

    guestGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    guestCard: {
        width: (SIZES.width - 32 - 24) / 3,
        backgroundColor: CARD,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER,
        alignItems: 'center',
        padding: 12,
        marginBottom: 12,
    },
    guestAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginBottom: 8,
    },
    guestName: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    guestFollowers: {
        color: MUTED_TEXT,
        fontSize: 11,
        marginTop: 2,
    },

    cta: {
        marginTop: 28,
        marginHorizontal: 16,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.golden,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        color: COLORS.black,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default ServiceDetails;
