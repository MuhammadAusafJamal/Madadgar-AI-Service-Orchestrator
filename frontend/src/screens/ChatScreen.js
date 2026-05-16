import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, StyleSheet, ActivityIndicator, Platform, KeyboardAvoidingView, StatusBar } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { ChatBubble } from '../components/ChatBubble';
import { ProviderCard } from '../components/ProviderCard';
import { BookingCard } from '../components/BookingCard';

export const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! Where to today? Let me know what service you need and where.', isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now().toString(), text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setResultData(null);

    try {
      // Use the actual Wi-Fi IP address so the physical phone can reach the backend
      const baseUrl = Platform.OS === 'web' ? 'http://127.0.0.1:5000' : 'http://192.168.100.9:5000';
      const history = messages.map(m => `${m.isUser ? 'User' : 'Assistant'}: ${m.text}`).join('\n');

      const response = await axios.post(`${baseUrl}/api/orchestration/chat`, {
        message: userMessage.text,
        history: history
      });

      const { success, message, booking, logs } = response.data;

      setMessages(prev => [...prev, { id: Date.now().toString() + 'ai', text: message, isUser: false }]);

      if (success && booking) {
        setResultData({ booking, logs });
      } else if (logs) {
        setResultData({ logs });
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString() + 'err', text: 'Sorry, I encountered an error connecting to the orchestration engine.', isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 85}
    >
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ChatBubble message={item.text} isUser={item.isUser} />}
        contentContainerStyle={styles.chatArea}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#46C96B" />
          <Text style={styles.loadingText}>Agents are reasoning...</Text>
        </View>
      )}

      {resultData?.booking && (
        <View style={styles.resultArea}>
          <BookingCard
            booking={resultData.booking}
            onPress={() => navigation.navigate('ProviderDetails', { provider: resultData.booking.provider })}
          />
          <TouchableOpacity style={styles.logsBtn} onPress={() => navigation.navigate('Logs', { logs: resultData.logs })}>
            <Ionicons name="layers-outline" size={18} color="#232323" style={{ marginRight: 8 }} />
            <Text style={styles.logsBtnText}>View AI Traces</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputWrapper}>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="e.g., Book an AC Tech in DHA..."
            placeholderTextColor="#8E8E8E"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F2' },
  chatArea: { padding: 16, paddingBottom: 20 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  loadingText: { color: '#46C96B', marginLeft: 8, fontSize: 14, fontWeight: '500' },
  resultArea: { paddingHorizontal: 16, paddingBottom: 16 },
  logsBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  logsBtnText: { color: '#232323', fontWeight: '600', fontSize: 15 },
  inputWrapper: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F1F5F2',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: '#232323',
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  sendBtn: {
    backgroundColor: '#46C96B',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: '#D0F2DA',
  }
});
