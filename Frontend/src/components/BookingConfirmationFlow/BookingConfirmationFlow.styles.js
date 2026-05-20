import { StyleSheet } from 'react-native';

import { PALETTE } from '@/src/theme';

const SURFACE = '#0F0F0F';
const CARD = '#1A1A1A';
const BORDER = '#2A2A2A';
export const MUTED = '#9CA3AF';
const RING = '#3B82F6';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: SURFACE,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 24,
    overflow: 'hidden',
  },
  sheetForm: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  body: {
    alignItems: 'center',
  },

  spinnerWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  spinnerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 5,
    borderColor: BORDER,
    borderTopColor: RING,
    borderRightColor: PALETTE.golden,
    position: 'absolute',
  },
  spinnerCenter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    color: PALETTE.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  quote: {
    color: MUTED,
    fontSize: 14,
    textAlign: 'center',
    minHeight: 40,
    paddingHorizontal: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BORDER,
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: PALETTE.golden,
    width: 18,
  },

  successIconWrap: {
    marginBottom: 18,
  },
  successRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: RING,
    backgroundColor: 'rgba(52,211,153,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    color: PALETTE.white,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    color: MUTED,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailText: {
    color: PALETTE.white,
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    height: 0.5,
    backgroundColor: BORDER,
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: BORDER,
  },
  secondaryBtnText: {
    color: PALETTE.white,
    fontSize: 15,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: PALETTE.golden,
  },
  primaryBtnText: {
    color: PALETTE.black,
    fontSize: 15,
    fontWeight: '700',
  },
  primaryBtnDisabled: {
    opacity: 0.45,
  },

  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  formTitle: {
    color: PALETTE.white,
    fontSize: 20,
    fontWeight: '800',
  },
  formCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSubtitle: {
    color: MUTED,
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 18,
  },
  formScroll: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    color: PALETTE.white,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  textInput: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: PALETTE.white,
    fontSize: 14,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  chipScroll: {
    paddingVertical: 2,
  },
  chipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
    marginRight: 8,
  },
  chipBtnActive: {
    backgroundColor: PALETTE.golden,
    borderColor: PALETTE.golden,
  },
  chipText: {
    color: PALETTE.white,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: PALETTE.black,
    fontWeight: '700',
  },
  helperText: {
    color: MUTED,
    fontSize: 11,
    marginTop: 6,
  },
});