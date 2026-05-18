import { StyleSheet } from 'react-native';

import { FONTS, PALETTE, SIZES } from '@/src/theme';

export const makeStyles = (colors) =>
  StyleSheet.create({
    area: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    scroll: {
      paddingBottom: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      height: 36,
      width: 36,
      borderRadius: 18,
      marginRight: 12,
    },
    username: {
      ...FONTS.bodyMedium,
      color: colors.text,
    },
    noti: {
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      borderRadius: 8,
      backgroundColor: PALETTE.red,
      position: 'absolute',
      top: -4,
      right: -4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notiText: {
      fontSize: 10,
      color: PALETTE.white,
      fontWeight: '700',
    },
    searchContainer: {
      height: 50,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginTop: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
    },
    searchInput: {
      ...FONTS.body,
      flex: 1,
      marginHorizontal: 10,
      color: colors.text,
    },
    serviceSlider: {
      width: '100%',
      marginTop: 12,
    },
    cardWrapper: {
      width: SIZES.width / 2 - 20,
      marginRight: 15,
    },
    section: {
      marginBottom: 40,
    },
    pill: {
      marginVertical: 5,
      borderColor: PALETTE.golden,
      borderWidth: 1.3,
      borderRadius: 15,
      marginRight: 10,
      paddingVertical: 8,
      paddingHorizontal: 18,
    },
    pillActive: {
      backgroundColor: PALETTE.golden,
    },
    pillText: {
      ...FONTS.bodyMedium,
      color: PALETTE.golden,
    },
    pillTextActive: {
      color: PALETTE.black,
    },
    emptyText: {
      ...FONTS.body,
      color: colors.textSecondary,
      paddingVertical: 32,
      textAlign: 'center',
    },
  });
