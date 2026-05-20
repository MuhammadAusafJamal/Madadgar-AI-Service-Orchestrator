import { View } from 'react-native';

import { PALETTE } from '@/src/theme';
import { styles } from './DotsView.styles';

export default function DotsView({
  activeIndex,
  numDots,
  dotSize = 10,
  dotSpacing = 5,
  activeColor = PALETTE.golden,
  inactiveColor = PALETTE.gray,
}) {
  return (
    <View style={styles.row}>
      {Array.from({ length: numDots }).map((_, i) => (
        <View
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            marginHorizontal: dotSpacing / 2,
            backgroundColor: activeIndex === i ? activeColor : inactiveColor,
          }}
        />
      ))}
    </View>
  );
}
