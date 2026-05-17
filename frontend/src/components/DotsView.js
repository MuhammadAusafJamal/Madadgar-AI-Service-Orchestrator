import { View } from 'react-native';
import React from 'react';
import { COLORS } from '../constants';

const DotsView = ({ activeIndex, numDots, dotSize = 10, dotSpacing = 5 }) => {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            {Array.from({ length: numDots }).map((_, i) => (
                <View
                    key={i}
                    style={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: dotSize / 2,
                        marginHorizontal: dotSpacing / 2,
                        backgroundColor: activeIndex === i ? COLORS.golden : 'gray',
                    }}
                />
            ))}
        </View>
    );
};

export default DotsView;
