import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { FONTS, PALETTE, useTheme } from '@/src/theme';

export default function LeaveReviewModal({
  visible,
  onClose,
  onSubmit,
  serviceLabel,
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ stars, text: text.trim() });
      setStars(5);
      setText('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Leave a review</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {!!serviceLabel && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {serviceLabel}
            </Text>
          )}

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setStars(n)} hitSlop={6}>
                <FontAwesome
                  name={n <= stars ? 'star' : 'star-o'}
                  size={32}
                  color={PALETTE.golden}
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="What stood out? (optional)"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={PALETTE.black} />
            ) : (
              <Text style={styles.submitText}>Post review</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    sheet: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      ...FONTS.small,
      color: colors.textSecondary,
      marginTop: 4,
      marginBottom: 8,
    },
    starsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 14,
    },
    input: {
      ...FONTS.body,
      color: colors.text,
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      minHeight: 90,
      textAlignVertical: 'top',
    },
    submitBtn: {
      marginTop: 16,
      height: 48,
      borderRadius: 24,
      backgroundColor: PALETTE.golden,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitText: {
      color: PALETTE.black,
      fontSize: 15,
      fontWeight: '700',
    },
  });
