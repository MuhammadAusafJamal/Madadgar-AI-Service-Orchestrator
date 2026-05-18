import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { useTheme } from '@/src/theme';
import { makeStyles } from './Input.styles';

export default function Input({
  label,
  error,
  style,
  inputStyle,
  multiline = false,
  ...rest
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const styles = makeStyles(colors);

  return (
    <View style={[styles.group, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.inputFocused,
          error && styles.inputError,
          inputStyle,
        ]}
        placeholderTextColor={colors.textSecondary}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
