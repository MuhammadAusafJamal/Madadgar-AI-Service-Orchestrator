import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

const SURFACE = '#0F0F0F';
const CARD = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED = '#9CA3AF';
const ACCENT = '#e4b722';

const STATIC_BOOKINGS = [
  {
    id: '1',
    title: 'AC Repair & Cleaning',
    provider: 'CoolFix Services',
    date: 'Mon, May 20 — 10:00 AM',
    status: 'Confirmed',
    image: 'https://picsum.photos/seed/booking1/200/200',
  },
  {
    id: '2',
    title: 'Deep Home Cleaning',
    provider: 'SparkleClean Pro',
    date: 'Wed, May 22 — 02:00 PM',
    status: 'In Progress',
    image: 'https://picsum.photos/seed/booking2/200/200',
  },
  {
    id: '3',
    title: 'Plumbing — Kitchen Sink',
    provider: 'QuickFix Plumbers',
    date: 'Fri, May 24 — 11:30 AM',
    status: 'Pending',
    image: 'https://picsum.photos/seed/booking3/200/200',
  },
  {
    id: '4',
    title: 'Electrical Wiring Check',
    provider: 'SafeWatt Electric',
    date: 'Sat, May 25 — 09:00 AM',
    status: 'Completed',
    image: 'https://picsum.photos/seed/booking4/200/200',
  },
];

const STATUS_COLOR = {
  Confirmed: '#34D399',
  'In Progress': '#60A5FA',
  Pending: '#FACC15',
  Completed: MUTED,
};

const Bookings = ({ navigation }) => {
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>My Bookings</Text>
      <TouchableOpacity>
        <Ionicons name="filter" size={22} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.thumb} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardProvider}>{item.provider}</Text>
        <View style={styles.cardRow}>
          <Ionicons name="time-outline" size={14} color={MUTED} />
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: (STATUS_COLOR[item.status] || MUTED) + '22' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: STATUS_COLOR[item.status] || MUTED },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        {renderHeader()}
        <FlatList
          data={STATIC_BOOKINGS}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardProvider: {
    fontSize: 13,
    color: MUTED,
    marginTop: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardDate: {
    fontSize: 12,
    color: MUTED,
    marginLeft: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default Bookings;
