import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/src/components/Header';
import { useAuth } from '@/src/context/AuthContext';
import { getUserProfile, logoutUser } from '@/src/services/authService';
import { getBookingsCountByUser } from '@/src/services/bookingService';
import { getFavouritesCountByUser } from '@/src/services/favouriteService';
import { seedFirestore } from '@/src/services/seedService';
import { PALETTE, SCHEME_OPTIONS, useTheme } from '@/src/theme';
import { makeStyles } from './ProfileScreen.styles';

const FALLBACK_AVATAR = 'https://i.pravatar.cc/200?u=madadgar-default';

const SETTINGS = [
  { id: 'bookings', label: 'My Bookings', icon: 'calendar-outline' },
  { id: 'edit', label: 'Edit Profile', icon: 'person-outline' },
  // { id: 'payment', label: 'Payment Methods', icon: 'card-outline' },
  // { id: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
  // { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' },
  // { id: 'about', label: 'About', icon: 'information-circle-outline' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, preference, setScheme } = useTheme();
  const { user, role } = useAuth();
  const styles = makeStyles(colors);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [bookingsCount, setBookingsCount] = useState(null);
  const [favouritesCount, setFavouritesCount] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!user?.uid || !role) {
      setProfile(null);
      setBookingsCount(null);
      setFavouritesCount(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    Promise.all([
      getUserProfile(user.uid, role).catch(() => null),
      getBookingsCountByUser(user.uid).catch(() => 0),
      getFavouritesCountByUser(user.uid).catch(() => 0),
    ]).then(([data, bCount, fCount]) => {
      if (cancelled) return;
      setProfile(data);
      setBookingsCount(bCount);
      setFavouritesCount(fCount);
      setProfileLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, role]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // ignore — auth state listener will still fire if signed out
    }
    router.replace('/(auth)/role');
  };

  const handleSeed = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      const result = await seedFirestore({ currentUid: user?.uid, role });
      Alert.alert(
        'Seed complete',
        `Categories, providers, services and reviews loaded.\nDemo bookings created: ${result.demoBookingsSeeded}`,
      );
    } catch (e) {
      Alert.alert('Seed failed', e?.message || 'Could not write to Firestore.');
    } finally {
      setSeeding(false);
    }
  };

  const displayName = profile?.fullName || user?.displayName || (user?.email?.split('@')[0]) || 'Guest';
  const displayEmail = user?.email || profile?.email || '—';
  const displayPhone = profile?.phone;
  const displayRole = role === 'provider' ? 'Service Provider' : 'Service Taker';
  const avatarUri = profile?.profilePic || profile?.photoURL || user?.photoURL || FALLBACK_AVATAR;
  const isVerified = profile?.verified === true;

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header
          title="Profile"
          allowBackIcon={false}
          actionIcon="ellipsis-horizontal"
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.profileCard}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            {profileLoading ? (
              <ActivityIndicator color={colors.accent} style={{ marginTop: 14 }} />
            ) : (
              <>
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.email}>{displayEmail}</Text>
                {!!displayPhone && <Text style={styles.email}>{displayPhone}</Text>}
              </>
            )}

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{bookingsCount ?? '—'}</Text>
                <Text style={styles.statLabel}>Bookings</Text>
              </View>
              <View style={styles.verticalLine} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{favouritesCount ?? '—'}</Text>
                <Text style={styles.statLabel}>Favourites</Text>
              </View>
              <View style={styles.verticalLine} />
              <View style={styles.statBox}>
                <MaterialIcons
                  name={isVerified ? 'verified' : 'verified-user'}
                  size={18}
                  color={isVerified ? PALETTE.golden : colors.textSecondary}
                />
                <Text style={styles.statLabel}>
                  {isVerified ? 'Verified' : 'Unverified'}
                </Text>
              </View>
            </View>

            <View style={styles.btnContainer}>
              <LinearGradient
                colors={['#e4b722', '#f3da87']}
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 1, y: 1 }}
                style={styles.roleButton}
              >
                <Text style={styles.roleText}>{displayRole}</Text>
              </LinearGradient>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Appearance</Text>
          <View style={styles.toggleRow}>
            {SCHEME_OPTIONS.map((option) => {
              const active = preference === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setScheme(option)}
                  style={[
                    styles.toggleButton,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      { color: active ? PALETTE.white : colors.text },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.settingsContainer}>
            {SETTINGS.map((item) => (
              <TouchableOpacity key={item.id} style={styles.settingsRow}>
                <View style={styles.settingsLeft}>
                  <Ionicons name={item.icon} size={22} color={colors.text} />
                  <Text style={styles.settingsLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.settingsRow}
              onPress={handleSeed}
              disabled={seeding}
            >
              <View style={styles.settingsLeft}>
                <Ionicons name="sparkles-outline" size={22} color={PALETTE.golden} />
                <Text style={styles.settingsLabel}>
                  {seeding ? 'Seeding demo data…' : 'Reseed Demo Data'}
                </Text>
              </View>
              {seeding ? (
                <ActivityIndicator size="small" color={PALETTE.golden} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
              <Text style={styles.logoutLabel}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
