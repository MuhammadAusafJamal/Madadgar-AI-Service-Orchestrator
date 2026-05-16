import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let MapView, Marker;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

export const ProviderDetailsScreen = ({ route, navigation }) => {
  const { provider } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#232323" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Provider Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.profileSection}>
          <Image source={{ uri: provider.profilePic }} style={styles.profileImage} />
          <Text style={styles.name}>{provider.name}</Text>
          <Text style={styles.location}>{provider.service} Provider</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="location" size={24} color="#46C96B" />
            <Text style={styles.statValue}>{provider.distance} km</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="time" size={24} color="#46C96B" />
            <Text style={styles.statValue}>{provider.experience} Years</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="star" size={24} color="#46C96B" />
            <Text style={styles.statValue}>{provider.rating} Rating</Text>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <View style={[styles.tab, styles.activeTab]}>
            <Text style={styles.activeTabText}>About</Text>
          </View>
          <View style={styles.tab}>
            <Text style={styles.inactiveTabText}>Review</Text>
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {provider.about} <Text style={styles.readMore}>Read More</Text>
          </Text>

          {Platform.OS !== 'web' && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Live Location</Text>
              <View style={styles.mapContainer}>
                <MapView 
                  style={styles.map}
                  initialRegion={{
                    latitude: provider.lat,
                    longitude: provider.lon,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                >
                  <Marker 
                    coordinate={{ latitude: provider.lat, longitude: provider.lon }}
                    title={provider.name}
                    description="Provider's current location"
                  >
                    <Ionicons name="location" size={32} color="#46C96B" />
                  </Marker>
                </MapView>
              </View>
            </>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Professional Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expertise</Text>
            <Text style={styles.detailValue}>Residential & Commercial</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>License ID</Text>
            <Text style={styles.detailValue}>LIC-10948</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Availability</Text>
            <Text style={styles.detailValue}>24/7 Emergency</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#232323',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#232323',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#8E8E8E',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statBox: {
    backgroundColor: '#F1F5F2',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#232323',
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#46C96B',
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#46C96B',
  },
  inactiveTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E8E',
  },
  contentSection: {
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#232323',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: '#8E8E8E',
    lineHeight: 22,
  },
  readMore: {
    color: '#46C96B',
    fontWeight: '600',
  },
  mapContainer: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#8E8E8E',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#232323',
    fontWeight: '700',
  }
});
