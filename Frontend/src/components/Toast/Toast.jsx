import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

// A lightweight app-styled toast — a brief, non-blocking message that slides in
// from the top and auto-dismisses. Use instead of the native Alert for
// success / error feedback.
const VARIANTS = {
  success: { bg: '#16a34a', icon: 'checkmark-circle' },
  error: { bg: '#dc2626', icon: 'alert-circle' },
  info: { bg: '#2563eb', icon: 'information-circle' },
};

export default function Toast({
  visible,
  message,
  type = 'success',
  duration = 2200,
  onHide,
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  useEffect(() => {
    if (!visible) return undefined;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => onHideRef.current?.());
    }, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, anim]);

  if (!visible) return null;
  const variant = VARIANTS[type] || VARIANTS.success;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          backgroundColor: variant.bg,
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-24, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Ionicons name={variant.icon} size={18} color="#ffffff" />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 1000,
    elevation: 8,
  },
  text: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
