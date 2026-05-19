import { StyleSheet } from 'react-native';

import { FONTS, PALETTE } from '@/src/theme';

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
      paddingBottom: 32,
    },
    profileCard: {
      alignItems: 'center',
      borderBottomColor: colors.border,
      borderBottomWidth: 0.5,
      paddingVertical: 20,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 2,
      borderColor: PALETTE.golden,
    },
    name: {
      ...FONTS.h3,
      color: colors.text,
      fontWeight: '700',
      marginTop: 14,
    },
    email: {
      ...FONTS.small,
      color: colors.textSecondary,
      marginTop: 4,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: 20,
      alignItems: 'center',
    },
    statBox: {
      alignItems: 'center',
      flex: 1,
    },
    verticalLine: {
      width: 1,
      height: 32,
      backgroundColor: colors.border,
    },
    statNumber: {
      ...FONTS.h3,
      color: colors.text,
      fontWeight: '700',
    },
    statLabel: {
      ...FONTS.caption,
      color: colors.textSecondary,
      marginTop: 4,
    },
    btnContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 18,
    },
    roleButton: {
      borderRadius: 15,
      paddingVertical: 10,
      paddingHorizontal: 22,
    },
    roleText: {
      ...FONTS.bodyMedium,
      color: PALETTE.white,
      fontWeight: '700',
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    sectionLabel: {
      ...FONTS.caption,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 20,
      marginBottom: 10,
    },
    toggleRow: {
      flexDirection: 'row',
      gap: 8,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: 'center',
    },
    toggleText: {
      ...FONTS.small,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    settingsContainer: {
      marginTop: 16,
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    settingsLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingsLabel: {
      ...FONTS.body,
      color: colors.text,
      marginLeft: 14,
    },
    logoutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 18,
      marginTop: 8,
    },
    logoutLabel: {
      ...FONTS.body,
      color: '#FF6B6B',
      marginLeft: 14,
      fontWeight: '600',
    },
  });
