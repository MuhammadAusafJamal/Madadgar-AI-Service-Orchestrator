import { StyleSheet } from 'react-native';

import { FONTS, SIZES } from '@/src/theme';

export const makeStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 16,
      justifyContent: 'center',
    },
    brand: {
      alignItems: 'center',
      marginBottom: 24,
    },
    logo: {
      width: 88,
      height: 88,
    },
    header: {
      marginBottom: 32,
      alignItems: 'center',
    },
    title: {
      ...FONTS.h1,
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      ...FONTS.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      ...FONTS.h3,
      color: colors.text,
      marginBottom: 4,
    },
    cardDesc: {
      ...FONTS.small,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 32,
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
