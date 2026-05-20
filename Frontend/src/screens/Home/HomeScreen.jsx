import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/theme';

import ProviderHomeScreen from './ProviderHomeScreen';
import TakerHomeScreen from './TakerHomeScreen';

export default function HomeScreen() {
  const { role, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return role === 'provider' ? <ProviderHomeScreen /> : <TakerHomeScreen />;
}
