import { StyleSheet } from 'react-native';

import { FONTS, SIZES } from '@/src/theme';

export const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: 12,
      width: (SIZES.width - 32) / 4,
    },
    iconContainer: {
      width: 54,
      height: 54,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    name: {
      ...FONTS.small,
      color: colors.text,
      fontWeight: '500',
    },
  });
