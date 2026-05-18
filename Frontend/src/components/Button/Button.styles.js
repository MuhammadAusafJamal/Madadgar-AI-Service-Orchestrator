import { StyleSheet } from 'react-native';

import { SIZES, FONTS } from '@/src/theme';

export const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderWidth: 1,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    overflow: 'hidden',
    width: SIZES.width,
  },
  text: {
    ...FONTS.button,
    textAlign: 'center',
    color: 'rgb(255, 255, 255)',
  },

  gradientRoot: {
    position: 'absolute',
    width: SIZES.width,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBtnRoot: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: SIZES.width,
    borderColor: 'transparent',
  },

  glassyRoot: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 20,
    marginBottom: 36,
    alignItems: 'center',
    borderColor: 'transparent',
  },
  glassyBtnText: {
    color: 'rgb(255, 255, 255)',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
});
