import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ChatBubble = ({ message, isUser }) => {
  return (
    <View style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleWrapper: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  aiWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#46C96B',
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  aiText: {
    color: '#232323',
    fontWeight: '400',
  },
});
