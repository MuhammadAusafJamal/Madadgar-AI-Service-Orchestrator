import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

import { useAuth } from '@/src/context/AuthContext';
import { usePeerChat } from '@/src/hooks/usePeerChat';
import { makeStyles } from '@/src/screens/Chat/ChatScreen.styles';
import { useTheme } from '@/src/theme';

export default function PeerChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = makeStyles(colors);

  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const peerId = params.peerId;
  const peerName = params.peerName || 'Provider';
  const peerAvatar = params.peerAvatar;
  const serviceLabel = params.serviceLabel;

  const meta = peerId
    ? { peerId, peerName, serviceLabel: serviceLabel || null, participants: [user?.uid, peerId].filter(Boolean) }
    : {};

  const { messages, send, loading } = usePeerChat(sessionId, user?.uid, meta);

  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [messages.length]);

  const canSend = draft.trim().length > 0 && !!sessionId && !!user?.uid;

  const handleSend = () => {
    const text = draft;
    setDraft('');
    send(text);
  };

  const renderItem = ({ item }) => {
    const mine = item.senderId === user?.uid;
    return (
      <View
        style={[
          styles.messageRow,
          mine ? styles.messageRowUser : styles.messageRowAssistant,
        ]}
      >
        {!mine && (
          <Image
            source={{ uri: peerAvatar || 'https://i.pravatar.cc/100?u=peer' }}
            style={[styles.avatar, { backgroundColor: 'transparent' }]}
          />
        )}
        <View
          style={[
            styles.bubble,
            mine ? styles.bubbleUser : styles.bubbleAssistant,
          ]}
        >
          <Text style={mine ? styles.bubbleTextUser : styles.bubbleTextAssistant}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.area} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={localHeaderStyles(colors).header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Image
          source={{ uri: peerAvatar || 'https://i.pravatar.cc/100?u=peer' }}
          style={localHeaderStyles(colors).avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={localHeaderStyles(colors).name} numberOfLines={1}>
            {peerName}
          </Text>
          {!!serviceLabel && (
            <Text style={localHeaderStyles(colors).subtitle} numberOfLines={1}>
              {serviceLabel}
            </Text>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        {loading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Start the conversation</Text>
            <Text style={styles.emptyHint}>
              Ask {peerName} about availability, pricing or scope of work.
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
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder={`Message ${peerName}…`}
            placeholderTextColor={colors.textSecondary}
            multiline
            onSubmitEditing={canSend ? handleSend : undefined}
            blurOnSubmit={false}
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

const localHeaderStyles = (colors) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
