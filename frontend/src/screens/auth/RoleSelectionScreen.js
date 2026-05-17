import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export const RoleSelectionScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>How would you like to use the app?</Text>
        </View>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('ServiceTakerSignup')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="search" size={32} color="#46C96B" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>I Want a Service</Text>
            <Text style={styles.cardDesc}>Find professionals like plumbers, electricians, or tutors near you.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#C4C4C4" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('ProviderSignup')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="briefcase" size={32} color="#46C96B" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>I Provide Services</Text>
            <Text style={styles.cardDesc}>Offer your skills and connect with customers in your area.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#C4C4C4" />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F5F2',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#232323',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E8E',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E9F8EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#232323',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#8E8E8E',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 16,
    color: '#8E8E8E',
  },
  loginText: {
    fontSize: 16,
    color: '#46C96B',
    fontWeight: '700',
  }
});
