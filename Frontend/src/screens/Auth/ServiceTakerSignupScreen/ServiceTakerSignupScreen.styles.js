import { StyleSheet } from 'react-native';

import { FONTS, PALETTE, SIZES } from '@/src/theme';

export const makeStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 48,
    },
    backBtn: {
      marginTop: 8,
      marginBottom: 24,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      marginBottom: 28,
    },
    title: {
      ...FONTS.h1,
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      ...FONTS.body,
      color: colors.textSecondary,
    },
    errorText: {
      ...FONTS.small,
      color: PALETTE.error,
      backgroundColor: PALETTE.transparentRed,
      padding: 12,
      borderRadius: SIZES.radiusSmall,
      marginBottom: 16,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: SIZES.radiusSmall,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
    primaryBtnDisabled: {
      opacity: 0.7,
    },
    primaryBtnText: {
      ...FONTS.button,
      color: PALETTE.white,
      fontWeight: '700',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
    },
    footerText: {
      ...FONTS.body,
      color: colors.textSecondary,
    },
    footerLink: {
      ...FONTS.bodyMedium,
      color: colors.primary,
      fontWeight: '700',
    },
  });
