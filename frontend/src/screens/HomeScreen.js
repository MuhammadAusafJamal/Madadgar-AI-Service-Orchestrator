import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.iconContainer}>
        <Ionicons name="construct" size={48} color="#46C96B" />
      </View>
      
      <Text style={styles.title}>Service AI</Text>
      <Text style={styles.subtitle}>Book any home service instantly.</Text>
      
      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => navigation.navigate('Chat')}
      >
        <Text style={styles.btnText}>Find a Provider</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" style={{marginLeft: 8}} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F2',
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#D0F2DA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#232323',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E8E',
    marginBottom: 56,
    textAlign: 'center',
    fontWeight: '400',
  },
  btn: {
    backgroundColor: '#46C96B',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#46C96B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  }
});
