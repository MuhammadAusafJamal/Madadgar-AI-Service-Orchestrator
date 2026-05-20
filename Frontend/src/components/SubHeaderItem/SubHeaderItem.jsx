import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/src/theme';
import { makeStyles } from './SubHeaderItem.styles';

export default function SubHeaderItem({ title, navTitle, onPress }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {navTitle ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <Text style={styles.navTitle}>{navTitle}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
