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
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 8,
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

    intentChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 8,
      maxWidth: '90%',
    },
    intentChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    intentChipText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },

    suggestionsWrap: {
      marginTop: 10,
      gap: 8,
      width: '92%',
    },
    suggestionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 8,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    suggestionImage: {
      width: 56,
      height: 56,
      borderRadius: 10,
      backgroundColor: colors.border,
    },
    suggestionBody: {
      flex: 1,
      gap: 3,
    },
    suggestionTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    suggestionMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    suggestionMeta: {
      color: colors.textSecondary,
      fontSize: 11,
      flexShrink: 1,
    },
    suggestionMetaDot: {
      color: colors.textSecondary,
      fontSize: 11,
      marginHorizontal: 2,
    },
    suggestionPrice: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '700',
    },
    suggestionBookBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.accent,
    },
    suggestionBookText: {
      color: '#1a1a1a',
      fontSize: 12,
      fontWeight: '800',
    },

    noMatchesWrap: {
      marginTop: 10,
      width: '92%',
      gap: 8,
    },
    noMatchesText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontStyle: 'italic',
      lineHeight: 16,
    },
    categoryChipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    categoryChipText: {
      fontSize: 11,
      fontWeight: '700',
    },
    slotChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    slotChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    slotChipText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: '600',
    },
  });
