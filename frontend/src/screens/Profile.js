import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants';

const SURFACE = '#0F0F0F';
const CARD = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED = '#9CA3AF';
const ACCENT = '#e4b722';

const STATIC_USER = {
  name: 'Muhammad Ausaf',
  email: 'abc@g.com',
  role: 'Service Taker',
  avatar: 'https://i.pravatar.cc/200?u=hackathon-profile',
  stats: {
    bookings: 12,
    favourites: 8,
    rating: 4.9,
  },
};

const SETTINGS = [
  { id: 'bookings', label: 'My Bookings', icon: 'calendar-outline' },
  { id: 'edit', label: 'Edit Profile', icon: 'person-outline' },
  { id: 'payment', label: 'Payment Methods', icon: 'card-outline' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' },
  { id: 'about', label: 'About', icon: 'information-circle-outline' },
];

const Profile = ({ navigation }) => {
  const safeNav = (screen) => {
    if (navigation?.navigate) navigation.navigate(screen);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => navigation?.goBack && navigation.goBack()}
        style={styles.headerLeft}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        <Text style={styles.headerTitle}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  const renderProfileCard = () => (
    <View style={styles.profileContainer}>
      <Image source={{ uri: STATIC_USER.avatar }} resizeMode="cover" style={styles.avatar} />
      <Text style={styles.name}>{STATIC_USER.name}</Text>
      <Text style={styles.email}>{STATIC_USER.email}</Text>

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
          <MaterialIcons name="verified" size={18} color={ACCENT} />
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
          <Text style={styles.roleText}>{STATIC_USER.role}</Text>
        </LinearGradient>
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      {SETTINGS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.settingsRow}
          onPress={() => safeNav(item.id)}
        >
          <View style={styles.settingsLeft}>
            <Ionicons name={item.icon} size={22} color={COLORS.white} />
            <Text style={styles.settingsLabel}>{item.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MUTED} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutRow}>
        <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
        <Text style={styles.logoutLabel}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        {renderHeader()}
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderProfileCard()}
          {renderSettings()}
        </ScrollView>
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
    marginBottom: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    color: COLORS.white,
    marginLeft: 12,
  },
  profileContainer: {
    alignItems: 'center',
    borderBottomColor: BORDER,
    borderBottomWidth: 0.5,
    paddingVertical: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: ACCENT,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 14,
  },
  email: {
    fontSize: 14,
    color: MUTED,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 22,
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  verticalLine: {
    width: 1,
    height: 32,
    backgroundColor: BORDER,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 13,
    color: MUTED,
    marginTop: 4,
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  roleButton: {
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginHorizontal: 5,
  },
  roleText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  settingsContainer: {
    marginVertical: 12,
  },
  settingsRow: {
    width: SIZES.width - 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 14,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    marginTop: 8,
  },
  logoutLabel: {
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 14,
    fontWeight: '600',
  },
});

export default Profile;
