import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

const SURFACE = '#0F0F0F';
const CARD = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED = '#9CA3AF';
const ACCENT = '#e4b722';

const STATIC_FAVOURITES = [
  {
    id: '1',
    name: 'CoolFix AC Services',
    category: 'HVAC',
    rating: 4.8,
    price: 'Rs. 2,500',
    image: 'https://picsum.photos/seed/fav1/300/200',
  },
  {
    id: '2',
    name: 'SparkleClean Pro',
    category: 'Cleaning',
    rating: 4.9,
    price: 'Rs. 3,200',
    image: 'https://picsum.photos/seed/fav2/300/200',
  },
  {
    id: '3',
    name: 'QuickFix Plumbers',
    category: 'Plumbing',
    rating: 4.6,
    price: 'Rs. 1,800',
    image: 'https://picsum.photos/seed/fav3/300/200',
  },
  {
    id: '4',
    name: 'SafeWatt Electric',
    category: 'Electrical',
    rating: 4.7,
    price: 'Rs. 2,100',
    image: 'https://picsum.photos/seed/fav4/300/200',
  },
  {
    id: '5',
    name: 'GreenThumb Gardening',
    category: 'Outdoor',
    rating: 4.5,
    price: 'Rs. 1,500',
    image: 'https://picsum.photos/seed/fav5/300/200',
  },
  {
    id: '6',
    name: 'PaintPerfect Studio',
    category: 'Painting',
    rating: 4.8,
    price: 'Rs. 4,000',
    image: 'https://picsum.photos/seed/fav6/300/200',
  },
];

const Favourite = ({ navigation }) => {
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Favourites</Text>
      <TouchableOpacity>
        <Ionicons name="search" size={22} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.thumb} />
      <TouchableOpacity style={styles.heartBtn}>
        <Ionicons name="heart" size={18} color={ACCENT} />
      </TouchableOpacity>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={ACCENT} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        {renderHeader()}
        <FlatList
          data={STATIC_FAVOURITES}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
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
    width: '48%',
    backgroundColor: CARD,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: 110,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    padding: 6,
  },
  cardBody: {
    padding: 10,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardCategory: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.white,
    marginLeft: 3,
  },
  priceText: {
    fontSize: 12,
    color: ACCENT,
    fontWeight: '600',
  },
});

export default Favourite;
