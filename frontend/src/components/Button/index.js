import React from 'react';
import {
    Text,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './style';
import ButtonLoader from './ButtonLoader';

const ButtonUpd = ({
    title = '',
    onPress = () => { },
    isLoading = false,
    variant = 'default',
    style = {},
    textStyle = {},
    loaderProps = {
        size: 'large',
        color: 'rgba(255, 255, 255 , 1)',
    },
    loaderStyles = {},
}) => {
    const isLinearGradient = variant === 'gradient';
    const isGlassyVariant = variant === 'glassy';
    const isDefaultGradient = variant === 'gradient';
    if (!title) return;
    // ✅ Linear Gradient Variant
    if (isLinearGradient) {
        return (
            <TouchableOpacity
                onPress={!isLoading ? onPress : null}
                activeOpacity={0.8}
                style={[styles.btn, styles.gradientBtnRoot, style]}
            >
                <LinearGradient
                    colors={['#e4b722', '#f3da87']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.gradientRoot]}
                >
                    {isLoading ? (
                        <ButtonLoader {...loaderProps} styles={loaderStyles} />
                    ) : (
                        <Text style={[styles.text, textStyle]}>
                            {title}
                        </Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    // ✅ Regular Button
    return (
        <TouchableOpacity
            onPress={!isLoading ? onPress : null}
            disabled={isLoading}
            activeOpacity={0.8}
            style={[
                styles.btn,
                style,
                isGlassyVariant && styles.glassyRoot,
            ]}
        >
            {isLoading ? (
                <ButtonLoader {...loaderProps} styles={loaderStyles} />
            ) : (
                <Text style={[
                    styles.text,
                    textStyle,
                    isGlassyVariant && styles.glassyBtnText,
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};



export default ButtonUpd;
