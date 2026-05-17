import React from 'react';
import {
    ActivityIndicator,
} from 'react-native';
import styles from './style';

const ButtonLoader = ({
    size = 'small',
    color = 'rgba(255, 255, 255 , 1)',
    styles = {},
}) => {
    return (
        <ActivityIndicator size={size} color={color} style={[styles.loader, styles]} />
    )
};

export default ButtonLoader;
