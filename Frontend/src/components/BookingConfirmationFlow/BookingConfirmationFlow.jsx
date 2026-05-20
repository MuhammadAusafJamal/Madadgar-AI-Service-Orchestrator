import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  TIME_SLOTS,
  buildDateOptions,
  extractClockHour,
  extractIntentDateKey,
} from '@/src/constants/booking';
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

// Convert a 24-hour hour value to a TIME_SLOTS label, or null when the hour
// falls outside our bookable 10 AM–9 PM window.
const hourToSlot = (hh) => {
  if (hh == null || hh < 10 || hh > 21) return null;
  const meridian = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 || 12;
  const slot = `${h12}:00 ${meridian}`;
  return TIME_SLOTS.includes(slot) ? slot : null;
};

// Map a natural-language time string (from the chat assistant) to the closest
// matching dateKey + timeSlot from our chips. Returns { dateKey, timeSlot }
// with either field null when the parser couldn't infer it. Date and clock
// parsing is delegated to the shared helpers in constants/booking so this form
// resolves dates/times exactly the way the chat validator does.
const parsePrefilledTime = (text, dateOptions) => {
  const result = { dateKey: null, timeSlot: null };
  if (!text || typeof text !== 'string') return result;
  const lower = text.toLowerCase();

  // Date: today / tomorrow / weekday / explicit calendar date. Only accept it
  // when it lands inside our bookable window of date chips.
  const dateKey = extractIntentDateKey(text);
  if (dateKey && dateOptions.some((d) => d.key === dateKey)) {
    result.dateKey = dateKey;
  } else if (/\bavailable\b/.test(lower)) {
    result.dateKey = dateOptions[0]?.key || null;
  }

  // Time: explicit 12-/24-hour clock snapped to the nearest slot, else a
  // period word.
  result.timeSlot = hourToSlot(extractClockHour(text));
  if (!result.timeSlot) {
    if (/\bmorning\b/.test(lower)) result.timeSlot = '10:00 AM';
    else if (/\bnoon\b/.test(lower)) result.timeSlot = '12:00 PM';
    else if (/\bafternoon\b/.test(lower)) result.timeSlot = '2:00 PM';
    else if (/\bevening\b/.test(lower)) result.timeSlot = '6:00 PM';
    else if (/\bnight\b/.test(lower)) result.timeSlot = '8:00 PM';
  }

  return result;
};

export default function BookingConfirmationFlow({
  visible,
  onClose,
  onViewBooking,
  onSubmit,
  booking,
  defaultLocation = '',
  defaultTimeText = '',
  quotes = DEFAULT_QUOTES,
  durationMs = DEFAULT_DURATION_MS,
}) {
  const [phase, setPhase] = useState('form');
  const [quoteIndex, setQuoteIndex] = useState(0);

  const dateOptions = useMemo(buildDateOptions, []);
  const parsedDefaults = useMemo(
    () => parsePrefilledTime(defaultTimeText, dateOptions),
    [defaultTimeText, dateOptions],
  );

  const [location, setLocation] = useState(defaultLocation);
  const [dateKey, setDateKey] = useState(parsedDefaults.dateKey || dateOptions[0]?.key);
  const [timeSlot, setTimeSlot] = useState(parsedDefaults.timeSlot || TIME_SLOTS[1]);
  const [reason, setReason] = useState('');

  const spinValue = useRef(new Animated.Value(0)).current;
  const quoteFade = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0.6)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    setPhase('form');
    setQuoteIndex(0);
    setLocation(defaultLocation);
    setDateKey(parsedDefaults.dateKey || dateOptions[0]?.key);
    setTimeSlot(parsedDefaults.timeSlot || TIME_SLOTS[1]);
    setReason('');
    quoteFade.setValue(1);
    successScale.setValue(0.6);
    successOpacity.setValue(0);
  }, [visible, defaultLocation, parsedDefaults, dateOptions]);

  useEffect(() => {
    if (phase !== 'loading') return undefined;

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
  }, [phase, durationMs, quotes.length]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isFormValid =
    location.trim().length > 0 &&
    !!dateKey &&
    !!timeSlot &&
    reason.trim().length > 0;

  const submittedDateLabel =
    dateOptions.find((d) => d.key === dateKey)?.label || '';

  const handleConfirm = () => {
    if (!isFormValid) return;
    const payload = {
      location: location.trim(),
      dateKey,
      dateLabel: submittedDateLabel,
      timeSlot,
      reason: reason.trim(),
      scheduledAt: new Date(`${dateKey}T${convertTo24h(timeSlot)}:00`),
    };
    if (typeof onSubmit === 'function') {
      try {
        onSubmit(payload);
      } catch (_) {
        // ignore — submission errors shouldn't block the UI flow
      }
    }
    setPhase('loading');
  };

  const renderForm = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ width: '100%' }}
    >
      <View style={styles.formHeaderRow}>
        <Text style={styles.formTitle}>Book this service</Text>
        <TouchableOpacity style={styles.formCloseBtn} onPress={onClose}>
          <Ionicons name="close" size={18} color={PALETTE.white} />
        </TouchableOpacity>
      </View>
      <Text style={styles.formSubtitle}>
        Share a few details so the provider can prepare and arrive ready.
      </Text>

      <ScrollView
        style={styles.formScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabelRow}>
            <Ionicons name="location-outline" size={16} color={PALETTE.golden} />
            <Text style={styles.fieldLabel}>Your location</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Address, area or landmark"
            placeholderTextColor={MUTED}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabelRow}>
            <Ionicons name="calendar-outline" size={16} color={PALETTE.golden} />
            <Text style={styles.fieldLabel}>Preferred date</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
          >
            {dateOptions.map((d) => {
              const active = d.key === dateKey;
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.chipBtn, active && styles.chipBtnActive]}
                  onPress={() => setDateKey(d.key)}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabelRow}>
            <Ionicons name="time-outline" size={16} color={PALETTE.golden} />
            <Text style={styles.fieldLabel}>Preferred time</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
          >
            {TIME_SLOTS.map((t) => {
              const active = t === timeSlot;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chipBtn, active && styles.chipBtnActive]}
                  onPress={() => setTimeSlot(t)}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabelRow}>
            <Ionicons
              name="document-text-outline"
              size={16}
              color={PALETTE.golden}
            />
            <Text style={styles.fieldLabel}>What needs fixing?</Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="e.g. Kitchen tap is leaking from the base, sometimes drips even when closed."
            placeholderTextColor={MUTED}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.helperText}>
            A clear description helps the provider come prepared.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.secondaryBtn]}
          onPress={onClose}
        >
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.primaryBtn,
            !isFormValid && styles.primaryBtnDisabled,
          ]}
          disabled={!isFormValid}
          onPress={handleConfirm}
        >
          <Text style={styles.primaryBtnText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderLoading = () => (
    <View style={styles.body}>
      <View style={styles.spinnerWrap}>
        <Animated.View
          style={[styles.spinnerRing, { transform: [{ rotate: spin }] }]}
        />
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
          <View
            key={i}
            style={[styles.dot, i === quoteIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );

  const renderSuccess = () => {
    const title = booking?.title || 'Booking Request Sent';
    const providerName = booking?.provider || 'the provider';
    const subtitle =
      booking?.subtitle ||
      `Your request has been sent to ${providerName}. They will review and reply shortly in chat.`;
    const serviceLabel = booking?.serviceLabel || booking?.service || 'Service';
    const whenLabel = `${submittedDateLabel} · ${timeSlot}`;
    const locationLabel = location || booking?.locationLabel || '';

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
            <Text style={styles.detailText}>{whenLabel}</Text>
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
          {!!reason && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={MUTED}
                />
                <Text style={styles.detailText} numberOfLines={3}>
                  {reason}
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

  const renderPhase = () => {
    if (phase === 'form') return renderForm();
    if (phase === 'loading') return renderLoading();
    return renderSuccess();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={phase === 'loading' ? undefined : onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View
          style={[styles.sheet, phase === 'form' && styles.sheetForm]}
        >
          {renderPhase()}
        </View>
      </View>
    </Modal>
  );
}

function convertTo24h(slot) {
  // "9:00 AM" -> "09:00", "1:00 PM" -> "13:00"
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(slot || '');
  if (!match) return '09:00';
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const meridian = match[3].toUpperCase();
  if (meridian === 'PM' && hour !== 12) hour += 12;
  if (meridian === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${minute}`;
}