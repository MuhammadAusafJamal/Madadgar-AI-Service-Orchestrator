import { StyleSheet } from 'react-native';

import { FONTS, PALETTE, SIZES } from '@/src/theme';

export const makeStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: { flex: 1 },
    flex1: { flex: 1 },
    gap: { width: 12 },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...FONTS.h3,
      color: colors.text,
      fontWeight: '700',
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 60,
    },
    sectionTitle: {
      ...FONTS.h2,
      color: colors.text,
      marginBottom: 16,
    },
    sectionSpaced: {
      marginTop: 8,
    },
    fieldLabel: {
      ...FONTS.bodyMedium,
      color: colors.text,
      marginBottom: 8,
    },
    fieldError: {
      ...FONTS.caption,
      color: PALETTE.error,
      marginTop: 6,
    },
    errorText: {
      ...FONTS.small,
      color: PALETTE.error,
      backgroundColor: PALETTE.transparentRed,
      padding: 12,
      borderRadius: SIZES.radiusSmall,
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      ...FONTS.small,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    chipTextSelected: {
      color: PALETTE.white,
      fontWeight: '700',
    },
    uploadSection: {
      marginTop: 8,
      marginBottom: 20,
      padding: 18,
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    uploadBlock: {
      marginBottom: 12,
    },
    uploadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: PALETTE.transparentPrimary,
      padding: 14,
      borderRadius: SIZES.radiusSmall,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    uploadBtnText: {
      ...FONTS.bodyMedium,
      color: colors.primary,
      fontWeight: '700',
      marginLeft: 8,
    },
    fileName: {
      ...FONTS.caption,
      marginTop: 8,
      color: colors.primary,
      fontWeight: '500',
    },
    imagePreviewContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 14,
      gap: 12,
    },
    previewWrapper: { position: 'relative' },
    previewImg: { width: 70, height: 70, borderRadius: 12 },
    removeImgBtn: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: PALETTE.white,
      borderRadius: 10,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: SIZES.radiusSmall,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
    primaryBtnDisabled: { opacity: 0.7 },
    primaryBtnText: {
      ...FONTS.button,
      color: PALETTE.white,
      fontWeight: '700',
    },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingText: {
      ...FONTS.bodyMedium,
      color: PALETTE.white,
      marginLeft: 8,
    },
  });
