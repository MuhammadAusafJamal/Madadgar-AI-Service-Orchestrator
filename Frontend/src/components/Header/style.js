import { StyleSheet } from 'react-native';

import { PALETTE, SIZES } from '@/src/theme';

export const makeStyles = (colors) =>
  StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerContainerProfile: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: SIZES.width - 32,
      paddingTop: 16,
      paddingBottom: 16,
      backgroundColor: colors.background,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      height: 36,
      width: 36,
      borderRadius: 999,
      marginRight: 12,
    },
    username: {
      fontSize: 16,
      maxWidth: '70%',
      fontWeight: '600',
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
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginLeft: 8,
    },
    actionText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '600',
    },
  });
