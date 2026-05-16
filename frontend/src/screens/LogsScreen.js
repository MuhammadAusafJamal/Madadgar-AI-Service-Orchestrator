import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { AgentLogCard } from '../components/AgentLogCard';

export const LogsScreen = ({ route }) => {
  const { logs } = route.params || { logs: [] };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Reasoning & Orchestration Logs</Text>
      <FlatList
        data={logs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <AgentLogCard log={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e' },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', padding: 16, backgroundColor: '#000' },
  list: { padding: 16 }
});
