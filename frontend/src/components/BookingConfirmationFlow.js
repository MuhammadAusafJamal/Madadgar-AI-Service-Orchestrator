import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    TouchableOpacity,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const SURFACE = '#0F0F0F';
const CARD = '#1A1A1A';
const BORDER = '#2A2A2A';
const MUTED = '#9CA3AF';
const ACCENT = '#e4b722';
const SUCCESS = '#34D399';
const RING = '#3B82F6';

const DEFAULT_QUOTES = [
    'Finding the best provider near you…',
    'Checking availability for your time slot…',
    'Reviewing ratings and reviews…',
    'Locking in your booking…',
    'Notifying the provider…',
    'Almost there — finalizing details…',
];

const QUOTE_INTERVAL_MS = 1500;
const DEFAULT_DURATION_MS = 4500;

const BookingConfirmationFlow = ({
    visible,
    onClose,
    onViewBooking,
    booking,
    quotes = DEFAULT_QUOTES,
    durationMs = DEFAULT_DURATION_MS,
}) => {
    const [phase, setPhase] = useState('loading');
    const [quoteIndex, setQuoteIndex] = useState(0);

    const spinValue = useRef(new Animated.Value(0)).current;
    const quoteFade = useRef(new Animated.Value(1)).current;
    const successScale = useRef(new Animated.Value(0.6)).current;
    const successOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible) return;

        setPhase('loading');
        setQuoteIndex(0);
        quoteFade.setValue(1);
        successScale.setValue(0.6);
        successOpacity.setValue(0);

        const spinLoop = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1200,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        );
        spinValue.setValue(0);
        spinLoop.start();

        const quoteTimer = setInterval(() => {
            Animated.sequence([
                Animated.timing(quoteFade, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(quoteFade, {
                    toValue: 1,
                    duration: 280,
                    useNativeDriver: true,
                }),
            ]).start();
            setTimeout(() => {
                setQuoteIndex((prev) => (prev + 1) % quotes.length);
            }, 220);
        }, QUOTE_INTERVAL_MS);

        const successTimer = setTimeout(() => {
            setPhase('success');
            spinLoop.stop();
            Animated.parallel([
                Animated.spring(successScale, {
                    toValue: 1,
                    friction: 5,
                    tension: 80,
                    useNativeDriver: true,
                }),
                Animated.timing(successOpacity, {
                    toValue: 1,
                    duration: 320,
                    useNativeDriver: true,
                }),
            ]).start();
        }, durationMs);

        return () => {
            spinLoop.stop();
            clearInterval(quoteTimer);
            clearTimeout(successTimer);
        };
    }, [visible, durationMs, quotes.length]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const renderLoading = () => (
        <View style={styles.body}>
            <View style={styles.spinnerWrap}>
                <Animated.View
                    style={[
                        styles.spinnerRing,
                        { transform: [{ rotate: spin }] },
                    ]}
                />
                <View style={styles.spinnerCenter}>
                    <Ionicons name="sparkles" size={22} color={ACCENT} />
                </View>
            </View>

            <Text style={styles.loadingTitle}>Confirming your booking</Text>

            <Animated.Text style={[styles.quote, { opacity: quoteFade }]}>
                {quotes[quoteIndex]}
            </Animated.Text>

            <View style={styles.dotsRow}>
                {quotes.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i === quoteIndex && styles.dotActive,
                        ]}
                    />
                ))}
            </View>
        </View>
    );

    const renderSuccess = () => {
        const title = booking?.title || 'Booking Request Sent';
        const provider = booking?.provider || 'the provider';
        const subtitle =
            booking?.subtitle ||
            `Your request has been sent to ${provider}. They will review and reply shortly in chat.`;
        const dateLabel = booking?.dateLabel || booking?.date || 'Today';
        const serviceLabel = booking?.serviceLabel || booking?.service || 'Service';
        const locationLabel = booking?.locationLabel || booking?.location || '';

        return (
            <Animated.View
                style={[
                    styles.body,
                    {
                        opacity: successOpacity,
                        transform: [{ scale: successScale }],
                    },
                ]}
            >
                <View style={styles.successIconWrap}>
                    <View style={styles.successRing}>
                        <Ionicons name="checkmark" size={44} color={SUCCESS} />
                    </View>
                </View>

                <Text style={styles.successTitle}>{title}</Text>
                <Text style={styles.successSubtitle}>{subtitle}</Text>

                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={18} color={MUTED} />
                        <Text style={styles.detailText}>{dateLabel}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <FontAwesome name="leaf" size={16} color={MUTED} />
                        <Text style={styles.detailText}>{serviceLabel}</Text>
                    </View>
                    {!!locationLabel && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={18} color={MUTED} />
                                <Text style={styles.detailText} numberOfLines={2}>
                                    {locationLabel}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.secondaryBtn]}
                        onPress={onClose}
                    >
                        <Text style={styles.secondaryBtnText}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.primaryBtn]}
                        onPress={onViewBooking || onClose}
                    >
                        <Text style={styles.primaryBtnText}>View Booking</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={phase === 'success' ? onClose : undefined}
            statusBarTranslucent
        >
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    {phase === 'loading' ? renderLoading() : renderSuccess()}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.78)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    sheet: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: SURFACE,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: BORDER,
        padding: 24,
        overflow: 'hidden',
    },
    body: {
        alignItems: 'center',
    },

    // Loading
    spinnerWrap: {
        width: 110,
        height: 110,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    spinnerRing: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 5,
        borderColor: BORDER,
        borderTopColor: RING,
        borderRightColor: ACCENT,
        position: 'absolute',
    },
    spinnerCenter: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: CARD,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    quote: {
        color: MUTED,
        fontSize: 14,
        textAlign: 'center',
        minHeight: 40,
        paddingHorizontal: 8,
    },
    dotsRow: {
        flexDirection: 'row',
        marginTop: 16,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: BORDER,
        marginHorizontal: 3,
    },
    dotActive: {
        backgroundColor: ACCENT,
        width: 18,
    },

    // Success
    successIconWrap: {
        marginBottom: 18,
    },
    successRing: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 4,
        borderColor: RING,
        backgroundColor: 'rgba(52,211,153,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    successTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    successSubtitle: {
        color: MUTED,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    detailsCard: {
        width: '100%',
        backgroundColor: CARD,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER,
        paddingVertical: 6,
        paddingHorizontal: 14,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    detailText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 12,
        flex: 1,
    },
    divider: {
        height: 0.5,
        backgroundColor: BORDER,
    },
    actionsRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: BORDER,
    },
    secondaryBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    primaryBtn: {
        backgroundColor: ACCENT,
    },
    primaryBtnText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default BookingConfirmationFlow;
