import { SIZES } from './sizes';

// Font family slots — point each to a loaded font.
// To add a custom family: drop the .ttf in `assets/fonts/`, load it in
// `app/_layout.jsx` via `useFonts({ 'Inter-Regular': require(...) })`,
// then change the right-hand side here. `undefined` falls back to the
// platform's system font.
export const FONT_FAMILY = {
  regular: undefined,
  medium: undefined,
  semiBold: undefined,
  bold: undefined,
  black: undefined,
  mono: 'SpaceMono',
};

export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  black: '900',
};

export const FONT_SIZE = {
  caption: 12,
  small: 14,
  body: 16,
  large: 18,
  h3: SIZES.h3,
  h2: SIZES.h2,
  h1: SIZES.h1,
  display: SIZES.largeTitle,
};

// Composed text styles. Use as `style={[FONTS.h1, { color }]}`.
export const FONTS = {
  display: {
    fontFamily: FONT_FAMILY.black,
    fontWeight: FONT_WEIGHT.black,
    fontSize: FONT_SIZE.display,
    lineHeight: 55,
  },
  h1: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.h1,
    lineHeight: 40,
  },
  h2: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.h2,
    lineHeight: 30,
  },
  h3: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHT.semiBold,
    fontSize: FONT_SIZE.h3,
    lineHeight: 22,
  },
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular,
    fontSize: FONT_SIZE.body,
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY.medium,
    fontWeight: FONT_WEIGHT.medium,
    fontSize: FONT_SIZE.body,
    lineHeight: 22,
  },
  small: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular,
    fontSize: FONT_SIZE.small,
    lineHeight: 20,
  },
  caption: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: FONT_WEIGHT.regular,
    fontSize: FONT_SIZE.caption,
    lineHeight: 16,
  },
  button: {
    fontFamily: FONT_FAMILY.semiBold,
    fontWeight: FONT_WEIGHT.semiBold,
    fontSize: FONT_SIZE.large,
  },
};
