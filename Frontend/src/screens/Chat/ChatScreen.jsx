import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useChat } from '@/src/hooks/useChat';
import { useTheme } from '@/src/theme';

import { makeStyles } from './ChatScreen.styles';

export default function ChatScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { messages, send, reset, loading } = useChat();

  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [messages.length, loading]);

  const handleSend = () => {
    const text = draft;
    setDraft('');
    send(text);
  };

  const canSend = draft.trim().length > 0 && !loading;

  const renderItem = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
          item.isError && styles.bubbleError,
        ]}
      >
        <Text style={isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.area} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Madadgar Assistant</Text>
        {messages.length > 0 && (
          <TouchableOpacity onPress={reset}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Ask Madadgar anything</Text>
            <Text style={styles.emptyHint}>
              Try: "Mujhe kal subah DHA Karachi mein AC technician chahiye"
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
