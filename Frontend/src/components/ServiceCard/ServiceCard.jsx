import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { PALETTE, useTheme } from '@/src/theme';
import { makeStyles } from './ServiceCard.styles';

export default function ServiceCard({
  image,
  providerName,
  eventDateTime,
  location,
  onPress,
  fullWidth,
}) {
  const { colors } = useTheme();
  const [favorited, setFavorited] = useState(false);
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.container, fullWidth ? styles.fullWidth : styles.gridWidth]}
    >
      <Image
        source={typeof image === 'string' ? { uri: image } : image}
        resizeMode="cover"
        style={styles.image}
      />

      <View style={styles.body}>
        <Text style={styles.providerName} numberOfLines={2} ellipsizeMode="tail">
          {providerName || 'Musical Event'}
        </Text>
        <Text style={styles.dateText}>
          {eventDateTime || 'Fri, Dec 20 — 12:00 - 15:00'}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.locationContainer}>
            <FontAwesome
              name="map-marker"
              size={16}
              color={PALETTE.golden}
              style={styles.locationIcon}
            />
            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.locationText}>
              {location || 'Green Park, New York'}
            </Text>
          </View>

          <TouchableOpacity onPress={() => setFavorited((v) => !v)} hitSlop={8}>
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={20}
              color={favorited ? PALETTE.red : PALETTE.golden}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
