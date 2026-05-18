import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/context/AuthContext';
import { logoutUser } from '@/src/services/authService';
import { PALETTE, SCHEME_OPTIONS, useTheme } from '@/src/theme';
import { makeStyles } from './ProfileScreen.styles';

const STATIC_USER = {
  name: 'Muhammad Ausaf',
  email: 'abc@g.com',
  avatar: 'https://i.pravatar.cc/200?u=hackathon-profile',
  stats: { bookings: 12, favourites: 8 },
};

const SETTINGS = [
  { id: 'bookings', label: 'My Bookings', icon: 'calendar-outline' },
  { id: 'edit', label: 'Edit Profile', icon: 'person-outline' },
  { id: 'payment', label: 'Payment Methods', icon: 'card-outline' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' },
  { id: 'about', label: 'About', icon: 'information-circle-outline' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, preference, setScheme } = useTheme();
  const { user, role } = useAuth();
  const styles = makeStyles(colors);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // ignore — auth state listener will still fire if signed out
    }
    router.replace('/(auth)/role');
  };

  const displayName = user?.displayName || STATIC_USER.name;
  const displayEmail = user?.email || STATIC_USER.email;
  const displayRole = role === 'provider' ? 'Service Provider' : 'Service Taker';

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.profileCard}>
            <Image source={{ uri: STATIC_USER.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{displayEmail}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{STATIC_USER.stats.bookings}</Text>
                <Text style={styles.statLabel}>Bookings</Text>
              </View>
              <View style={styles.verticalLine} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{STATIC_USER.stats.favourites}</Text>
                <Text style={styles.statLabel}>Favourites</Text>
              </View>
              <View style={styles.verticalLine} />
              <View style={styles.statBox}>
                <MaterialIcons name="verified" size={18} color={PALETTE.golden} />
                <Text style={styles.statLabel}>Verified</Text>
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
