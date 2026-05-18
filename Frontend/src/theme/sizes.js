import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SIZES = {
  base: 8,
  padding: 8,
  padding2: 12,
  padding3: 16,
  radius: 30,
  radiusSmall: 12,

  font: 14,
  largeTitle: 50,
  h1: 36,
  h2: 22,
  h3: 16,
  h4: 14,
  body1: 30,
  body2: 20,
  body3: 16,
  body4: 14,

  width,
  height,
};
