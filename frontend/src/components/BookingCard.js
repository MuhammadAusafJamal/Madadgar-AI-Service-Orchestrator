import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export const BookingCard = ({ booking, onPress }) => {
  const provider = booking.provider;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Booking Confirmed! 🎉</Text>
          <Text style={styles.subtitle}>Tap to view details</Text>
        </View>
        {provider?.profilePic && (
          <Image source={{ uri: provider.profilePic }} style={styles.profilePic} />
        )}
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Provider:</Text>
        <Text style={styles.value}>{booking.providerName}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Service:</Text>
        <Text style={styles.value}>{booking.service}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>{booking.location}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Distance Away:</Text>
        <Text style={styles.value}>{provider.distance} km</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Time:</Text>
        <Text style={styles.value}>{booking.time}</Text>
      </View>
      <Text style={styles.status}>Status: {booking.status}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#D0F2DA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#46C96B',
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E8E',
    marginTop: 4,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: '#8E8E8E',
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    color: '#232323',
    fontWeight: '600',
  },
  status: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    fontWeight: '700',
    color: '#46C96B',
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 1,
  }
});
