import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { useTheme } from '../theme/ThemeProvider';

// Static variant: Redux / axios / favorites-API / conflict-detection stripped.
// Heart toggle is local state only, no backend.
const ServiceCard = ({
    image,
    providerName,
    eventDateTime,
    location,
    onPress,
    fullWidth,
}) => {
    const { dark } = useTheme();
    const [favorited, setFavorited] = useState(false);

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.container,
                { backgroundColor: dark ? COLORS.dark2 : COLORS.white },
                fullWidth ? styles.fullWidth : styles.gridWidth,
            ]}
        >
            <Image
                source={typeof image === 'string' ? { uri: image } : image}
                resizeMode="cover"
                style={styles.courseImage}
            />

            <View style={{ flex: 1, minHeight: 140 }}>
                <View style={styles.topContainer}>
                    <Text
                        style={[
                            styles.providerName,
                            { color: dark ? COLORS.secondaryWhite : COLORS.greyscale900 },
                        ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {providerName || 'Musical Event'}
                    </Text>
                    <Text style={[styles.dateText, { color: COLORS.golden }]}>
                        {eventDateTime || 'Fri, Dec 20 — 12:00 - 15:00'}
                    </Text>
                </View>

                <View style={styles.bottomRow}>
                    <View style={styles.locationContainer}>
                        <FontAwesome
                            name="map-marker"
                            size={16}
                            color={COLORS.golden}
                            style={styles.locationIcon}
                        />
                        <Text
                            numberOfLines={2}
                            ellipsizeMode="tail"
                            style={[
                                styles.locationText,
                                { color: dark ? COLORS.secondaryWhite : COLORS.greyscale900 },
                            ]}
                        >
                            {location || 'Green Park, New York'}
                        </Text>
                    </View>

                    <TouchableOpacity onPress={() => setFavorited((v) => !v)}>
                        <Ionicons
                            name={favorited ? 'heart' : 'heart-outline'}
                            size={20}
                            color={favorited ? COLORS.red : COLORS.golden}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 0,
        marginVertical: 5,
        marginHorizontal: 5,
    },
    gridWidth: { width: '47%' },
    fullWidth: { width: '100%' },
    courseImage: {
        width: '100%',
        height: 124,
        borderRadius: 16,
        marginRight: 8,
        marginLeft: 8,
    },
    topContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        paddingTop: 20,
    },
    providerName: {
        fontSize: 14,
        fontFamily: 'medium',
        color: COLORS.greyscale900,
        width: '100%',
        flexWrap: 'wrap',
        lineHeight: 18,
        minHeight: 36,
        marginBottom: 10,
    },
    dateText: {
        fontSize: 14,
        fontFamily: 'medium',
        color: COLORS.greyscale900,
        width: '100%',
        flexWrap: 'wrap',
        lineHeight: 18,
        minHeight: 36,
        marginBottom: 10,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: 6,
        width: '100%',
        paddingHorizontal: 0,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        maxWidth: '80%',
        minHeight: 37,
    },
    locationIcon: {
        marginRight: 4,
    },
    locationText: {
        fontSize: 14,
        flexShrink: 1,
        flexWrap: 'wrap',
    },
});

export default ServiceCard;
