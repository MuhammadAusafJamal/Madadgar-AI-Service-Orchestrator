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
      paddingVertical: 16,
      textAlign: 'center',
    },
    filterIconWrap: {
      position: 'relative',
      padding: 4,
    },
    filterDot: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: PALETTE.golden,
    },
    activeFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: PALETTE.golden,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
    },
    activeFilterChipText: {
      ...FONTS.small,
      color: PALETTE.black,
      fontWeight: '700',
    },
    clearAllChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearAllChipText: {
      ...FONTS.small,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    resultsHeader: {
      // flexDirection: 'row',
      // alignItems: 'center',
      // justifyContent: 'space-between',
    },
    emptyWrap: {
      alignItems: 'center',
      gap: 10,
      paddingVertical: 32,
    },
    emptyAction: {
      ...FONTS.bodyMedium,
      color: PALETTE.golden,
      fontWeight: '700',
    },
  });
