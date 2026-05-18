import { Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import ButtonLoader from './ButtonLoader';
import { styles } from './Button.styles';

export default function Button({
  title = '',
  onPress = () => {},
  isLoading = false,
  variant = 'default', // 'default' | 'gradient' | 'glassy'
  style,
  textStyle,
  loaderProps = { size: 'large', color: 'rgba(255, 255, 255, 1)' },
}) {
  if (!title) return null;

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={!isLoading ? onPress : null}
        activeOpacity={0.8}
        style={[styles.btn, styles.gradientBtnRoot, style]}>
        <LinearGradient
          colors={['#e4b722', '#f3da87']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientRoot}>
          {isLoading ? (
            <ButtonLoader {...loaderProps} />
          ) : (
            <Text style={[styles.text, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const isGlassy = variant === 'glassy';

  return (
    <TouchableOpacity
      onPress={!isLoading ? onPress : null}
      disabled={isLoading}
      activeOpacity={0.8}
      style={[styles.btn, isGlassy && styles.glassyRoot, style]}>
      {isLoading ? (
        <ButtonLoader {...loaderProps} />
      ) : (
        <Text
          style={[
            styles.text,
            isGlassy && styles.glassyBtnText,
            textStyle,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
