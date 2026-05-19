import { StyleSheet } from 'react-native';

export const makeStyles = (colors) =>
  StyleSheet.create({
    area: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    listContent: {
      padding: 16,
      gap: 8,
    },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 6,
    },
    emptyHint: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    messageRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginVertical: 4,
    },
    messageRowUser: {
      justifyContent: 'flex-end',
    },
    messageRowAssistant: {
      justifyContent: 'flex-start',
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarAssistant: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarUser: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bubble: {
      maxWidth: '78%',
      padding: 12,
      borderRadius: 16,
    },
    bubbleUser: {
      backgroundColor: colors.accent,
      borderBottomRightRadius: 4,
    },
    bubbleAssistant: {
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 4,
    },
    bubbleError: {
      backgroundColor: 'rgba(247, 85, 85, 0.15)',
    },
    bubbleTextUser: {
      color: '#1a1a1a',
      fontSize: 15,
    },
    bubbleTextAssistant: {
      color: colors.text,
      fontSize: 15,
    },
    typingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    typingText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: 12,
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1,
      minHeight: 44,
      maxHeight: 120,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: colors.surface,
      borderRadius: 22,
      color: colors.text,
      fontSize: 15,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });
