import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { useTheme } from '../theme/ThemeProvider';

// Static variant: takes an Ionicons name string instead of an Image source,
// since our `icons` constant is an empty placeholder (the VIPLista icon PNGs
// were not ported over). Drop-in swap for the original Image-based Category.
const Category = ({
    onPress,
    name,
    icon = 'apps',
    iconColor = 'rgba(255, 152, 31, 1)',
    backgroundColor = 'rgba(255, 152, 31, 0.12)',
}) => {
    const { dark } = useTheme();
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.iconContainer, { backgroundColor }]}
                onPress={onPress}
            >
                <Ionicons name={icon} size={24} color={iconColor} />
            </TouchableOpacity>
            <Text style={[styles.name, {
                color: dark ? COLORS.white : COLORS.greyscale900,
            }]}>{name}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 12,
        width: (SIZES.width - 32) / 4,
    },
    iconContainer: {
        width: 54,
        height: 54,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        fontSize: 14,
        fontFamily: 'medium',
        color: COLORS.black,
    },
});

export default Category;
