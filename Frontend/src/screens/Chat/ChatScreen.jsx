import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/src/components/Header';
import { CATEGORIES } from '@/src/constants/categories';
import { useChat } from '@/src/hooks/useChat';
import { PALETTE, useTheme } from '@/src/theme';

import { makeStyles } from './ChatScreen.styles';

const formatPrice = (svc) => {
  if (typeof svc?.basePrice !== 'number') return null;
  const price = `PKR ${svc.basePrice.toLocaleString()}`;
  return svc.priceUnit ? `${price} · ${svc.priceUnit}` : price;
};

const fallbackImage = (id) => `https://picsum.photos/seed/${id || 'svc'}/400/300`;

const TYPING_SPEED_MS = 16;

function TypewriterText({ text, style, animate, onTick, onComplete }) {
  const [shown, setShown] = useState(animate ? '' : text);
  const lastAnimatedRef = useRef(animate ? '' : text);
  const [cursorOn, setCursorOn] = useState(true);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!animate) {
      setShown(text);
      lastAnimatedRef.current = text;
      setTyping(false);
      onComplete?.();
      return undefined;
    }
    if (lastAnimatedRef.current === text) return undefined;

    lastAnimatedRef.current = text;
    setShown('');
    setTyping(true);

    let i = 0;
    let cancelled = false;
    let timer;
    const step = () => {
      if (cancelled) return;
      i += 1;
      setShown(text.slice(0, i));
      onTick?.();
      if (i < text.length) {
        timer = setTimeout(step, TYPING_SPEED_MS);
      } else {
        setTyping(false);
        onComplete?.();
      }
    };
    timer = setTimeout(step, TYPING_SPEED_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, animate, onTick, onComplete]);

  useEffect(() => {
    if (!typing) {
      setCursorOn(false);
      return undefined;
    }
    setCursorOn(true);
    const blink = setInterval(() => setCursorOn((c) => !c), 450);
    return () => clearInterval(blink);
  }, [typing]);

  return (
    <Text style={style}>
      {shown}
      {typing && (
        <Text style={[style, { opacity: cursorOn ? 1 : 0 }]}>▌</Text>
      )}
    </Text>
  );
}

// Wraps content with a one-shot fade-in. Used to reveal suggestion cards and
// pills only after the typewriter has finished, so they don't appear before
// the assistant's text is done rendering.
function FadeIn({ children, duration = 260, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration]);
  return <Animated.View style={[{ opacity }, style]}>{children}</Animated.View>;
}

export default function ChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { messages, send, reset, loading } = useChat();

  const tabBarHeight = useBottomTabBarHeight();

  const [draft, setDraft] = useState('');
  const [completedIds, setCompletedIds] = useState(() => new Set());
  const listRef = useRef(null);
  const animatedIdsRef = useRef(new Set());

  const markComplete = (id) => {
    setCompletedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    if (messages.length > 0) scrollToEnd();
  }, [messages.length, loading]);

  const handleSend = () => {
    const text = draft;
    setDraft('');
    send(text);
  };

  const canSend = draft.trim().length > 0 && !loading;

  const openSuggestion = (service, message) => {
    router.push({
      pathname: '/service/[id]',
      params: {
        id: service.id,
        prefillLocation: message?.intent?.location || '',
        prefillTime: message?.intent?.time || '',
        autoBook: 'true',
      },
    });
  };

  const renderSuggestionCard = (service, message) => (
    <TouchableOpacity
      key={service.id}
      style={styles.suggestionCard}
      activeOpacity={0.85}
      onPress={() => openSuggestion(service, message)}
    >
      <Image
        source={{ uri: service.image || fallbackImage(service.id) }}
        style={styles.suggestionImage}
      />
      <View style={styles.suggestionBody}>
        <Text style={styles.suggestionTitle} numberOfLines={1}>
          {service.title || 'Service'}
        </Text>
        <View style={styles.suggestionMetaRow}>
          <FontAwesome name="star" size={11} color={PALETTE.golden} />
          <Text style={styles.suggestionMeta}>
            {service.rating ? service.rating.toFixed(1) : '—'}
          </Text>
          {!!service.location && (
            <>
              <Text style={styles.suggestionMetaDot}>·</Text>
              <Ionicons name="location-outline" size={11} color={colors.textSecondary} />
              <Text style={styles.suggestionMeta} numberOfLines={1}>
                {service.location}
              </Text>
            </>
          )}
          {typeof service._match?.distanceKm === 'number' && (
            <>
              <Text style={styles.suggestionMetaDot}>·</Text>
              <Ionicons name="navigate-outline" size={11} color={colors.textSecondary} />
              <Text style={styles.suggestionMeta}>
                {service._match.distanceKm.toFixed(1)} km
              </Text>
            </>
          )}
        </View>
        {!!formatPrice(service) && (
          <Text style={styles.suggestionPrice}>{formatPrice(service)}</Text>
        )}
      </View>
      <View style={styles.suggestionBookBtn}>
        <Text style={styles.suggestionBookText}>Book</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const isUser = item.role === 'user';
    const hasSuggestions = !isUser && Array.isArray(item.suggestions) && item.suggestions.length > 0;
    const intentComplete =
      !isUser && item.intent && item.intent.service && item.intent.location && item.intent.time;
    const shouldAnimate =
      !isUser && !item.isError && !animatedIdsRef.current.has(item.id);
    if (shouldAnimate) animatedIdsRef.current.add(item.id);

    // Extras (suggestion cards, slot pills, category chips) only reveal after
    // the typewriter has finished. Messages that don't animate (user lines,
    // errors, history-restored bubbles) reveal extras immediately.
    const extrasReady = !shouldAnimate || completedIds.has(item.id);

    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
        {!isUser && (
          <View style={[styles.avatar, styles.avatarAssistant]}>
            <Ionicons name="sparkles" size={16} color={colors.accent} />
          </View>
        )}
        <View style={{ flex: 1, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
          <View
            style={[
              styles.bubble,
              isUser ? styles.bubbleUser : styles.bubbleAssistant,
              item.isError && styles.bubbleError,
            ]}
          >
            {isUser || item.isError ? (
              <Text style={isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant}>
                {item.text}
              </Text>
            ) : (
              <TypewriterText
                text={item.text}
                style={styles.bubbleTextAssistant}
                animate={shouldAnimate}
                onTick={scrollToEnd}
                onComplete={() => markComplete(item.id)}
              />
            )}
          </View>

          {extrasReady && intentComplete && (
            <FadeIn style={styles.intentChipsRow}>
              <View style={styles.intentChip}>
                <Ionicons name="construct-outline" size={11} color={colors.textSecondary} />
                <Text style={styles.intentChipText}>{item.intent.service}</Text>
              </View>
              <View style={styles.intentChip}>
                <Ionicons name="location-outline" size={11} color={colors.textSecondary} />
                <Text style={styles.intentChipText}>{item.intent.location}</Text>
              </View>
              <View style={styles.intentChip}>
                <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
                <Text style={styles.intentChipText}>{item.intent.time}</Text>
              </View>
            </FadeIn>
          )}

          {extrasReady && hasSuggestions && (
            <FadeIn style={styles.suggestionsWrap}>
              {item.suggestions.map((svc) => renderSuggestionCard(svc, item))}
            </FadeIn>
          )}

          {extrasReady && item.showServiceCategories && (
            <FadeIn style={styles.noMatchesWrap}>
              <View style={styles.categoryChipsWrap}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.categoryChip, { backgroundColor: c.backgroundColor }]}
                    onPress={() => send(`I need a ${c.name}`)}
                    disabled={loading}
                  >
                    <Ionicons name={c.icon} size={12} color={c.iconColor} />
                    <Text style={[styles.categoryChipText, { color: c.iconColor }]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>
          )}

          {extrasReady && item.needsTimePick && Array.isArray(item.availableTimeSlots) && (
            <FadeIn style={styles.noMatchesWrap}>
              <View style={styles.slotChipsRow}>
                {item.availableTimeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={styles.slotChip}
                    onPress={() =>
                      send(
                        item.preservedDateText
                          ? `${item.preservedDateText} at ${slot}`
                          : slot,
                      )
                    }
                    disabled={loading}
                  >
                    <Ionicons name="time-outline" size={11} color={PALETTE.golden} />
                    <Text style={styles.slotChipText}>{slot}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>
          )}

          {extrasReady && item.needsDatePick && Array.isArray(item.availableDateOptions) && (
            <FadeIn style={styles.noMatchesWrap}>
              <View style={styles.slotChipsRow}>
                {item.availableDateOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={styles.slotChip}
                    onPress={() =>
                      send(
                        item.preservedTimeText
                          ? `${opt.label} at ${item.preservedTimeText}`
                          : opt.label,
                      )
                    }
                    disabled={loading}
                  >
                    <Ionicons name="calendar-outline" size={11} color={PALETTE.golden} />
                    <Text style={styles.slotChipText}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>
          )}

          {extrasReady && intentComplete && !hasSuggestions && !item.needsTimePick && !item.needsDatePick && (
            <FadeIn style={styles.noMatchesWrap}>
              <Text style={styles.noMatchesText}>
                I couldn't find any "{item.intent.service}" providers in our catalog yet.
                Try one of these instead:
              </Text>
              <View style={styles.categoryChipsWrap}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.categoryChip, { backgroundColor: c.backgroundColor }]}
                    onPress={() => send(`Show me ${c.name} options instead`)}
                    disabled={loading}
                  >
                    <Ionicons name={c.icon} size={12} color={c.iconColor} />
                    <Text style={[styles.categoryChipText, { color: c.iconColor }]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>
          )}
        </View>
        {isUser && (
          <View style={[styles.avatar, styles.avatarUser]}>
            <Ionicons name="person" size={16} color={colors.text} />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.area} edges={['top']}>
      <Header
        title="Madadgar Assistant"
        allowBackIcon={false}
        actionText={messages.length > 0 ? 'Clear' : undefined}
        onActionPress={reset}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? tabBarHeight : 0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Ask Madadgar anything</Text>
            <Text style={styles.emptyHint}>
              Try: "I want a booking in Karachi for replacing my AC"
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {loading && (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.typingText}>Madadgar is thinking…</Text>
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message…"
            placeholderTextColor={colors.textSecondary}
            multiline
            editable={!loading}
            onSubmitEditing={canSend ? handleSend : undefined}
            submitBehavior="newline"
          />
          <TouchableOpacity
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!canSend}
          >
            <Ionicons name="send" size={20} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}