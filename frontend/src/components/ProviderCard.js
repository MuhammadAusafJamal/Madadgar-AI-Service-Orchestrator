import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ProviderCard = ({ provider }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{provider.name}</Text>
      <Text style={styles.service}>{provider.service}</Text>
      <View style={styles.stats}>
        <Text style={styles.statText}>⭐ {provider.rating}</Text>
        <Text style={styles.statText}>📍 {provider.distance} km</Text>
        <Text style={styles.statText}>⚡ {provider.score}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    marginVertical: 8,
    borderLeftWidth: 6,
    borderLeftColor: '#46C96B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#232323',
    marginBottom: 4,
  },
  service: {
    color: '#8E8E8E',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F2',
    padding: 12,
    borderRadius: 16,
  },
  statText: {
    color: '#232323',
    fontWeight: '600',
    fontSize: 14,
  }
});
