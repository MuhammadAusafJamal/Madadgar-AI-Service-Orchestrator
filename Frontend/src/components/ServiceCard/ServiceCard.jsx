import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/src/context/AuthContext';
import { isFavourite, toggleFavourite } from '@/src/services/favouriteService';
import { PALETTE, useTheme } from '@/src/theme';
import { makeStyles } from './ServiceCard.styles';

export default function ServiceCard({
  image,
  providerName,
  eventDateTime,
  location,
  onPress,
  fullWidth,
  itemId,
  itemData,
}) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [toggling, setToggling] = useState(false);
  const styles = makeStyles(colors);

  useEffect(() => {
    let cancelled = false;
    if (!user?.uid || !itemId) {
      setFavorited(false);
      return;
    }
    isFavourite(user.uid, itemId)
      .then((v) => !cancelled && setFavorited(v))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.uid, itemId]);

  const handleToggleFavourite = async () => {
    if (!user?.uid || !itemId || toggling) return;
    setToggling(true);
    const previous = favorited;
    setFavorited(!previous);
    try {
      const nowFav = await toggleFavourite(user.uid, itemId, itemData || {});
      setFavorited(nowFav);
    } catch {
      setFavorited(previous);
    } finally {
      setToggling(false);
    }
  };

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

          <TouchableOpacity onPress={handleToggleFavourite} hitSlop={8} disabled={!user?.uid || !itemId}>
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
