import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Category from '@/src/components/Category';
import ServiceCard from '@/src/components/ServiceCard';
import SubHeaderItem from '@/src/components/SubHeaderItem';
import { PALETTE, SIZES, useTheme } from '@/src/theme';
import { makeStyles } from './HomeScreen.styles';

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
  { id: '1', eventName: 'Tech Founders Mixer 2026', eventDateTime: 'Fri, May 22 — 18:00 - 22:00', image: 'https://picsum.photos/seed/event1/600/400', location: 'Karachi Marriott, Ballroom A', category: 'tech' },
  { id: '2', eventName: 'Sunset Acoustic Night', eventDateTime: 'Sat, May 23 — 19:30 - 23:00', image: 'https://picsum.photos/seed/event2/600/400', location: 'Sea View Rooftop, Karachi', category: 'music' },
  { id: '3', eventName: 'Founders × Creators Brunch', eventDateTime: 'Sun, May 24 — 11:00 - 14:00', image: 'https://picsum.photos/seed/event3/600/400', location: "Xander's, DHA Phase 6", category: 'food' },
  { id: '4', eventName: 'Couture Week — VIP Preview', eventDateTime: 'Mon, May 25 — 20:00 - 23:00', image: 'https://picsum.photos/seed/event4/600/400', location: 'PC Hotel, Lahore', category: 'fashion' },
  { id: '5', eventName: 'Morning Run Club Launch', eventDateTime: 'Tue, May 26 — 06:30 - 08:30', image: 'https://picsum.photos/seed/event5/600/400', location: 'Bagh Ibn-e-Qasim, Karachi', category: 'fitness' },
  { id: '6', eventName: 'Northern Loop Travel Meet', eventDateTime: 'Wed, May 27 — 19:00 - 21:00', image: 'https://picsum.photos/seed/event6/600/400', location: 'Coffee Wagera, Islamabad', category: 'travel' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const filteredEvents =
    selectedCategories.length === 0
      ? STATIC_EVENTS
      : STATIC_EVENTS.filter((e) => selectedCategories.includes(e.category));

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <Image source={{ uri: STATIC_PROFILE.avatar }} style={styles.avatar} />
            </TouchableOpacity>
            <Text style={styles.username}>Hi, {STATIC_PROFILE.username}!</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {STATIC_PROFILE.unreadNotifications > 0 && (
              <View style={styles.noti}>
                <Text style={styles.notiText}>{STATIC_PROFILE.unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search services..."
              placeholderTextColor={colors.textSecondary}
            />
            <Ionicons name="options-outline" size={20} color={colors.text} />
          </View>

          <View style={styles.serviceSlider}>
            <FlatList
              data={STATIC_EVENTS}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={SIZES.width / 2 + 15}
              decelerationRate="fast"
              renderItem={({ item }) => (
                <View style={styles.cardWrapper}>
                  <ServiceCard
                    providerName={item.eventName}
                    eventDateTime={item.eventDateTime}
                    image={item.image}
                    location={item.location}
                    fullWidth
                  />
                </View>
              )}
            />
          </View>

          <SubHeaderItem title="Categories" navTitle="See all" />
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
              />
            )}
          />

          <View style={styles.section}>
            <SubHeaderItem title="Events" navTitle="See all" />
            <FlatList
              data={STATIC_CATEGORIES}
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
                    <Text
                      style={[styles.pillText, active && styles.pillTextActive]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            {filteredEvents.length < 1 ? (
              <Text style={styles.emptyText}>No Events</Text>
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
