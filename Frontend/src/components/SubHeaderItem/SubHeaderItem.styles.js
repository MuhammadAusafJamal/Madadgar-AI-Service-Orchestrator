import { StyleSheet } from 'react-native';

import { FONTS, PALETTE } from '@/src/theme';

export const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 16,
    },
    title: {
      ...FONTS.h3,
      color: colors.text,
      fontWeight: '700',
    },
    navTitle: {
      ...FONTS.bodyMedium,
      color: PALETTE.golden,
    },
  });
