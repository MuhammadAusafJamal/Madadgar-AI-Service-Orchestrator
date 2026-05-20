import { StyleSheet } from 'react-native';

import { PALETTE, SIZES } from '@/src/theme';

const SURFACE = '#0F0F0F';
const CARD = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED_TEXT = '#9CA3AF';

export const makeStyles = (_colors) =>
  StyleSheet.create({
    area: {
      flex: 1,
      backgroundColor: SURFACE,
    },
    headerOverride: {
      backgroundColor: SURFACE,
      borderBottomWidth: 0,
    },
    headerTitleOverride: {
      color: PALETTE.white,
    },
    backgroundImage: {
      height: 320,
      position: 'relative',
      marginHorizontal: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    overlayBGImg: {
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    cardContainer: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 12,
      padding: 14,
      gap: 10,
      backgroundColor: 'rgba(0, 109, 91, 0.75)',
    },
    contentContainer: {
      flex: 1,
    },
    fullName: {
      fontSize: 18,
      fontWeight: '800',
      color: PALETTE.white,
      marginBottom: 6,
    },
    dateText: {
      marginBottom: 8,
      color: PALETTE.golden,
      fontSize: 13,
      fontWeight: '600',
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    locationText: {
      fontSize: 13,
      color: PALETTE.white,
      maxWidth: '90%',
    },
    buttonActionRight: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1.4,
      borderColor: PALETTE.golden,
      alignItems: 'center',
      justifyContent: 'center',
    },

    tabBar: {
      flexDirection: 'row',
      marginTop: 24,
      marginHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    tabLabel: {
      fontSize: 15,
      color: MUTED_TEXT,
      fontWeight: '600',
    },
    tabLabelActive: {
      color: PALETTE.golden,
      fontWeight: '700',
    },
    tabIndicator: {
      position: 'absolute',
      bottom: -1,
      height: 2,
      width: '60%',
      backgroundColor: PALETTE.golden,
      borderRadius: 1,
    },
    tabContent: {
      paddingHorizontal: 16,
      paddingTop: 20,
    },

    sectionLabel: {
      color: PALETTE.white,
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 10,
    },
    bodyText: {
      color: '#D1D5DB',
      fontSize: 14,
      lineHeight: 22,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: CARD,
    },
    chipText: {
      color: PALETTE.white,
      fontSize: 13,
    },
    organizerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CARD,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: BORDER,
    },
    organizerAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    organizerName: {
      color: PALETTE.white,
      fontSize: 14,
      fontWeight: '700',
    },
    organizerTagline: {
      color: MUTED_TEXT,
      fontSize: 12,
      marginTop: 2,
    },
    providerContactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 6,
    },
    providerContactText: {
      color: PALETTE.golden,
      fontSize: 12,
      flexShrink: 1,
    },
    followBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: PALETTE.golden,
    },
    followBtnText: {
      color: PALETTE.golden,
      fontWeight: '700',
      fontSize: 13,
    },

    ratingSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CARD,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: BORDER,
      marginBottom: 16,
    },
    ratingNumber: {
      color: PALETTE.white,
      fontSize: 32,
      fontWeight: '800',
    },
    ratingCount: {
      color: MUTED_TEXT,
      fontSize: 12,
      marginTop: 4,
    },
    reviewCard: {
      backgroundColor: CARD,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 12,
      marginBottom: 12,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    reviewAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    reviewName: {
      color: PALETTE.white,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },
    reviewText: {
      color: '#D1D5DB',
      fontSize: 13,
      lineHeight: 19,
    },

    guestGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    guestCard: {
      width: (SIZES.width - 32 - 24) / 3,
      backgroundColor: CARD,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: BORDER,
      alignItems: 'center',
      padding: 12,
      marginBottom: 12,
    },
    guestAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginBottom: 8,
    },
    guestName: {
      color: PALETTE.white,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
    },
    guestFollowers: {
      color: MUTED_TEXT,
      fontSize: 11,
      marginTop: 2,
    },

    cta: {
      marginTop: 28,
      marginHorizontal: 16,
      height: 52,
      borderRadius: 26,
      backgroundColor: PALETTE.golden,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 28,
      marginHorizontal: 16,
    },
    ctaSecondary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 52,
      paddingHorizontal: 20,
      borderRadius: 26,
      borderWidth: 1.4,
      borderColor: PALETTE.golden,
      backgroundColor: 'transparent',
    },
    ctaSecondaryText: {
      color: PALETTE.golden,
      fontSize: 15,
      fontWeight: '700',
    },
    ctaPrimary: {
      flex: 1,
      height: 52,
      borderRadius: 26,
      backgroundColor: PALETTE.golden,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaText: {
      color: PALETTE.black,
      fontSize: 16,
      fontWeight: '700',
    },
  });
