import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    TextInput,
    FlatList,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import SubHeaderItem from '../components/SubHeaderItem';
import Category from '../components/Category';
import ServiceCard from '../components/ServiceCard';
import { ThemeContext } from '../theme/ThemeProvider';
import { darkColors } from '../theme/colors';

// Force dark theme for this screen. Children (SubHeaderItem / Category /
// ServiceCard) read `dark` from useTheme(), so we override the context here
// instead of editing each child.
const FORCED_DARK_THEME = {
    dark: true,
    colors: darkColors,
    setScheme: () => {},
};

const SURFACE = '#0F0F0F';      // screen background
const CARD_BORDER = '#2A2A2A';  // subtle border in dark mode
const MUTED_TEXT = '#9CA3AF';   // secondary text

// Static placeholder data — no Redux, no axios, no AsyncStorage.
const STATIC_PROFILE = {
    username: 'Muhammad',
    avatar: 'https://i.pravatar.cc/100?u=hackathon',
    unreadNotifications: 3,
};

const STATIC_CATEGORIES = [
    { id: 'tech', name: 'Tech', icon: 'laptop-outline', iconColor: '#7B9CFF', backgroundColor: 'rgba(123,156,255,0.18)' },
    { id: 'music', name: 'Music', icon: 'musical-notes-outline', iconColor: '#FF7B7B', backgroundColor: 'rgba(255,123,123,0.18)' },
    { id: 'fitness', name: 'Fitness', icon: 'barbell-outline', iconColor: '#34D399', backgroundColor: 'rgba(52,211,153,0.18)' },
    { id: 'fashion', name: 'Fashion', icon: 'shirt-outline', iconColor: '#A78BFA', backgroundColor: 'rgba(167,139,250,0.18)' },
    { id: 'food', name: 'Food', icon: 'restaurant-outline', iconColor: '#FACC15', backgroundColor: 'rgba(250,204,21,0.18)' },
    { id: 'travel', name: 'Travel', icon: 'airplane-outline', iconColor: '#60A5FA', backgroundColor: 'rgba(96,165,250,0.18)' },
    { id: 'health', name: 'Health', icon: 'medkit-outline', iconColor: '#F87171', backgroundColor: 'rgba(248,113,113,0.18)' },
    { id: 'product', name: 'Product', icon: 'cube-outline', iconColor: '#e4b822', backgroundColor: 'rgba(228,184,34,0.18)' },
];

const STATIC_EVENTS = [
    {
        id: '1',
        eventName: 'Tech Founders Mixer 2026',
        eventDateTime: 'Fri, May 22 — 18:00 - 22:00',
        image: 'https://picsum.photos/seed/event1/600/400',
        location: 'Karachi Marriott, Ballroom A',
        category: 'tech',
    },
    {
        id: '2',
        eventName: 'Sunset Acoustic Night',
        eventDateTime: 'Sat, May 23 — 19:30 - 23:00',
        image: 'https://picsum.photos/seed/event2/600/400',
        location: 'Sea View Rooftop, Karachi',
        category: 'music',
    },
    {
        id: '3',
        eventName: 'Founders × Creators Brunch',
        eventDateTime: 'Sun, May 24 — 11:00 - 14:00',
        image: 'https://picsum.photos/seed/event3/600/400',
        location: 'Xander\'s, DHA Phase 6',
        category: 'food',
    },
    {
        id: '4',
        eventName: 'Couture Week — VIP Preview',
        eventDateTime: 'Mon, May 25 — 20:00 - 23:00',
        image: 'https://picsum.photos/seed/event4/600/400',
        location: 'PC Hotel, Lahore',
        category: 'fashion',
    },
    {
        id: '5',
        eventName: 'Morning Run Club Launch',
        eventDateTime: 'Tue, May 26 — 06:30 - 08:30',
        image: 'https://picsum.photos/seed/event5/600/400',
        location: 'Bagh Ibn-e-Qasim, Karachi',
        category: 'fitness',
    },
    {
        id: '6',
        eventName: 'Northern Loop Travel Meet',
        eventDateTime: 'Wed, May 27 — 19:00 - 21:00',
        image: 'https://picsum.photos/seed/event6/600/400',
        location: 'Coffee Wagera, Islamabad',
        category: 'travel',
    },
];

const Home = ({ navigation }) => {
    const [search, setSearch] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);

    const toggleCategory = (categoryId) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((c) => c !== categoryId)
                : [...prev, categoryId]
        );
    };

    const filteredEvents = selectedCategories.length === 0
        ? STATIC_EVENTS
        : STATIC_EVENTS.filter((e) => selectedCategories.includes(e.category));

    const safeNav = (screen, params) => {
        if (navigation?.navigate) navigation.navigate(screen, params);
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
                <TouchableOpacity onPress={() => safeNav('Profile')}>
                    <Image source={{ uri: STATIC_PROFILE.avatar }} resizeMode="cover" style={styles.avatar} />
                </TouchableOpacity>
                <Text style={styles.username}>Hi, {STATIC_PROFILE.username}!</Text>
            </View>
            <TouchableOpacity onPress={() => safeNav('Notifications')}>
                <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
                {STATIC_PROFILE.unreadNotifications > 0 && (
                    <View style={styles.noti}>
                        <Text style={styles.notiText}>{STATIC_PROFILE.unreadNotifications}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <TouchableOpacity onPress={() => safeNav('Search')}>
                <Ionicons name="search" size={20} color={MUTED_TEXT} style={styles.searchIcon} />
            </TouchableOpacity>
            <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search Events..."
                placeholderTextColor={MUTED_TEXT}
                onFocus={() => safeNav('Search')}
            />
            <TouchableOpacity>
                <Ionicons name="options-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );

    const renderServiceSlider = () => (
        <View style={[
            styles.serviceSliderContainer,
            { alignItems: STATIC_EVENTS.length > 2 ? 'center' : 'flex-start' },
        ]}>
            <FlatList
                data={STATIC_EVENTS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <ServiceCard
                            providerName={item.eventName}
                            eventDateTime={item.eventDateTime}
                            image={item.image}
                            location={item.location}
                            onPress={() => safeNav('ServiceDetails', { event: item })}
                            fullWidth
                        />
                    </View>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                snapToInterval={SIZES.width / 2 + 15}
                decelerationRate="fast"
                contentContainerStyle={styles.flatListContent}
            />
        </View>
    );

    const renderCategories = () => (
        <View>
            <SubHeaderItem
                title="Categories"
                navTitle="See all"
                onPress={() => safeNav('PopularServices', { selectedCat: '', showAll: true })}
            />
            <FlatList
                data={STATIC_CATEGORIES}
                keyExtractor={(item) => item.id}
                numColumns={4}
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <Category
                        name={item.name}
                        icon={item.icon}
                        iconColor={item.iconColor}
                        backgroundColor={item.backgroundColor}
                        onPress={() => safeNav('PopularServices', { selectedCat: item.name, showAll: false })}
                    />
                )}
            />
        </View>
    );

    const renderTopServices = () => {
        const renderCategoryPill = ({ item }) => {
            const active = selectedCategories.includes(item.id);
            return (
                <TouchableOpacity
                    style={{
                        backgroundColor: active ? COLORS.golden : 'transparent',
                        marginVertical: 5,
                        borderColor: COLORS.golden,
                        borderWidth: 1.3,
                        borderRadius: 15,
                        marginRight: 12,
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                    }}
                    onPress={() => toggleCategory(item.id)}
                >
                    <Text style={{ color: active ? COLORS.black : COLORS.golden, fontWeight: '600' }}>
                        {item.name}
                    </Text>
                </TouchableOpacity>
            );
        };

        return (
            <View style={styles.mostPopularEventsBox}>
                <SubHeaderItem
                    title="Events"
                    navTitle="See all"
                    onPress={() => safeNav('PopularServices', { selectedCat: '', showAll: true })}
                />
                <FlatList
                    data={STATIC_CATEGORIES}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderCategoryPill}
                />
                {filteredEvents.length < 1 ? (
                    <Text style={{ color: COLORS.white, paddingBottom: 50, paddingTop: 30 }}>
                        No Events
                    </Text>
                ) : (
                    <FlatList
                        data={filteredEvents}
                        numColumns={2}
                        scrollEnabled={false}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <ServiceCard
                                providerName={item.eventName}
                                eventDateTime={item.eventDateTime}
                                image={item.image}
                                location={item.location}
                                onPress={() => safeNav('ServiceDetails', { event: item })}
                            />
                        )}
                    />
                )}
            </View>
        );
    };

    return (
        <ThemeContext.Provider value={FORCED_DARK_THEME}>
            <SafeAreaView style={styles.area}>
                <View style={styles.container}>
                    {renderHeader()}
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {renderSearchBar()}
                        {renderServiceSlider()}
                        {renderCategories()}
                        {renderTopServices()}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </ThemeContext.Provider>
    );
};

const styles = StyleSheet.create({
    mostPopularEventsBox: {
        marginBottom: 60,
    },
    serviceSliderContainer: {
        width: '100%',
        marginTop: 20,
        paddingBottom: 10,
    },
    flatListContent: {
        paddingLeft: 0,
        paddingRight: 30,
    },
    cardWrapper: {
        width: SIZES.width / 2 - 20,
        marginRight: 15,
    },
    area: {
        flex: 1,
        backgroundColor: SURFACE,
    },
    container: {
        flex: 1,
        backgroundColor: SURFACE,
        padding: 16,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: SIZES.width - 32,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
    },
    avatar: {
        height: 36,
        width: 36,
        borderRadius: 999,
        marginRight: 12,
    },
    username: {
        fontSize: 16,
        color: COLORS.white,
        maxWidth: '90%',
        fontFamily: 'coldiac',
        alignSelf: 'center',
    },
    noti: {
        minWidth: 16,
        height: 16,
        paddingHorizontal: 4,
        borderRadius: 8,
        backgroundColor: COLORS.red,
        position: 'absolute',
        top: -4,
        right: -4,
        zIndex: 99999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notiText: {
        fontSize: 11,
        color: COLORS.white,
        alignSelf: 'center',
        fontWeight: '600',
    },
    headerLeft: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    searchContainer: {
        height: 50,
        width: SIZES.width - 32,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: CARD_BORDER,
        backgroundColor: '#1A1A1A',
        marginTop: 22,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        marginHorizontal: 8,
        borderRightColor: CARD_BORDER,
        borderRightWidth: 0.4,
        color: COLORS.white,
    },
});

export default Home;
