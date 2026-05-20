import { StyleSheet } from 'react-native';

import { FONTS, PALETTE, SIZES } from '@/src/theme';

export const makeStyles = (colors) =>
  StyleSheet.create({
    group: {
      marginBottom: 18,
    },
    label: {
      ...FONTS.bodyMedium,
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      ...FONTS.body,
      backgroundColor: colors.surface,
      borderRadius: SIZES.radiusSmall,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: colors.text,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    inputFocused: {
      borderColor: colors.primary,
    },
    inputError: {
      borderColor: PALETTE.error,
    },
    multiline: {
      minHeight: 96,
      textAlignVertical: 'top',
      paddingTop: 14,
    },
    errorText: {
      ...FONTS.caption,
      color: PALETTE.error,
      marginTop: 6,
    },
  });
