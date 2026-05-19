import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Text, TouchableOpacity, View } from 'react-native';

import { PALETTE } from '@/src/theme';
import { styles, MUTED } from './BookingConfirmationFlow.styles';

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

export default function BookingConfirmationFlow({
  visible,
  onClose,
  onViewBooking,
  booking,
  quotes = DEFAULT_QUOTES,
  durationMs = DEFAULT_DURATION_MS,
}) {
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
        <Animated.View style={[styles.spinnerRing, { transform: [{ rotate: spin }] }]} />
        <View style={styles.spinnerCenter}>
          <Ionicons name="sparkles" size={22} color={PALETTE.golden} />
        </View>
      </View>

      <Text style={styles.loadingTitle}>Confirming your booking</Text>

      <Animated.Text style={[styles.quote, { opacity: quoteFade }]}>
        {quotes[quoteIndex]}
      </Animated.Text>

      <View style={styles.dotsRow}>
        {quotes.map((_, i) => (
          <View key={i} style={[styles.dot, i === quoteIndex && styles.dotActive]} />
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
          { opacity: successOpacity, transform: [{ scale: successScale }] },
        ]}
      >
        <View style={styles.successIconWrap}>
          <View style={styles.successRing}>
            <Ionicons name="checkmark" size={44} color="#34D399" />
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
          <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={onClose}>
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
}
