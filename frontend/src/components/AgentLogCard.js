import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AgentLogCard = ({ log }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.agent}>[{log.agent}]</Text>
      <Text style={styles.message}>{log.message}</Text>
      {log.data && (
        <Text style={styles.data}>
          {JSON.stringify(log.data, null, 2)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  agent: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    color: '#fff',
    fontSize: 14,
  },
  data: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'monospace',
  }
});
