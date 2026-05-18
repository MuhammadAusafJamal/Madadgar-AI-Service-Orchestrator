import { StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { useTheme } from '@/src/theme';

export default function ChatScreen() {
  const { sessionId } = useLocalSearchParams();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Chat' }} />
      <Text style={[styles.title, { color: colors.text }]}>ChatScreen</Text>
      <Text style={{ color: colors.textSecondary }}>session: {sessionId}</Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Wires to backend 8-agent pipeline.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hint: {
    marginTop: 12,
  },
});
