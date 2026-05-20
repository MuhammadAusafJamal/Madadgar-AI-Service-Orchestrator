import { StyleSheet } from 'react-native';

import { FONTS, PALETTE, SIZES } from '@/src/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    marginVertical: 18,
    alignItems: 'center',
  },
  subTitle: {
    ...FONTS.h2,
    color: PALETTE.golden,
    textAlign: 'center',
    marginTop: 8,
  },
  description: {
    ...FONTS.body,
    color: PALETTE.white,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 22,
  },
  dotsContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
    alignItems: 'center',
  },
  nextButton: {
    width: SIZES.width - 44,
    marginBottom: 12,
    marginTop: 22,
    borderRadius: 20,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    color: PALETTE.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  skipButton: {
    width: SIZES.width - 44,
    backgroundColor: 'transparent',
    borderColor: PALETTE.golden,
    borderRadius: 20,
  },
  icon: {
    width: '60%',
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    position: 'relative'
  },
});
