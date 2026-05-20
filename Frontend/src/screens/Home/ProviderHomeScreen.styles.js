import { StyleSheet } from 'react-native';

import { FONTS, PALETTE } from '@/src/theme';

export const makeProviderStyles = (colors) =>
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

    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    statLabel: {
      ...FONTS.small,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    statHint: {
      ...FONTS.small,
      color: colors.textSecondary,
      marginTop: 2,
    },

    nudgeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: PALETTE.golden,
      padding: 14,
      marginBottom: 20,
    },
    nudgeIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(250,204,21,0.12)',
    },
    nudgeTitle: {
      ...FONTS.bodyMedium,
      color: colors.text,
      fontWeight: '700',
      marginBottom: 2,
    },
    nudgeBody: {
      ...FONTS.small,
      color: colors.textSecondary,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      marginBottom: 10,
    },
    sectionTitle: {
      ...FONTS.bodyMedium,
      color: colors.text,
      fontWeight: '700',
      fontSize: 16,
    },
    sectionLink: {
      ...FONTS.small,
      color: PALETTE.golden,
      fontWeight: '600',
    },

    emptyText: {
      ...FONTS.body,
      color: colors.textSecondary,
      paddingVertical: 20,
      textAlign: 'center',
    },

    requestCard: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 10,
    },
    requestAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    requestName: {
      ...FONTS.bodyMedium,
      color: colors.text,
      fontWeight: '700',
    },
    requestService: {
      ...FONTS.small,
      color: colors.text,
      marginTop: 2,
    },
    requestMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    requestMeta: {
      ...FONTS.small,
      color: colors.textSecondary,
    },
    requestActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
    },
    actionBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 18,
      alignItems: 'center',
    },
    declineBtn: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    declineText: {
      ...FONTS.small,
      color: colors.text,
      fontWeight: '600',
    },
    acceptBtn: {
      backgroundColor: PALETTE.golden,
    },
    acceptText: {
      ...FONTS.small,
      color: PALETTE.black,
      fontWeight: '700',
    },

    jobCard: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 10,
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: PALETTE.golden,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
  });
