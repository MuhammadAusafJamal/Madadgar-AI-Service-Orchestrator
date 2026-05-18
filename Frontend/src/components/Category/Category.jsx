import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/src/theme';
import { makeStyles } from './Category.styles';

export default function Category({
  name,
  icon = 'apps',
  iconColor = 'rgba(255, 152, 31, 1)',
  backgroundColor = 'rgba(255, 152, 31, 0.12)',
  onPress,
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.iconContainer, { backgroundColor }]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Ionicons name={icon} size={24} color={iconColor} />
      </TouchableOpacity>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}
