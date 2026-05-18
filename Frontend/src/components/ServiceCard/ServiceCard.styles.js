import { StyleSheet } from 'react-native';

import { FONTS, PALETTE } from '@/src/theme';

export const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: colors.surface,
      shadowColor: PALETTE.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
      marginVertical: 5,
      marginHorizontal: 5,
    },
    gridWidth: { width: '47%' },
    fullWidth: { width: '100%' },
    image: {
      width: '100%',
      height: 124,
      borderRadius: 16,
    },
    body: {
      flex: 1,
      width: '100%',
      minHeight: 140,
      paddingTop: 12,
    },
    providerName: {
      ...FONTS.bodyMedium,
      color: colors.text,
      lineHeight: 18,
      minHeight: 36,
      marginBottom: 8,
    },
    dateText: {
      ...FONTS.small,
      color: PALETTE.golden,
      marginBottom: 8,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginTop: 6,
      width: '100%',
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
      maxWidth: '80%',
      minHeight: 37,
    },
    locationIcon: {
      marginRight: 4,
      marginTop: 2,
    },
    locationText: {
      ...FONTS.small,
      color: colors.text,
      flexShrink: 1,
      flexWrap: 'wrap',
    },
  });
