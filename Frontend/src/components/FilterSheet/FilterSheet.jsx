import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { CATEGORIES } from '@/src/constants/categories';
import { FONTS, PALETTE, useTheme } from '@/src/theme';

export const SORT_OPTIONS = [
  { id: 'rating', label: 'Top rated' },
  { id: 'priceAsc', label: 'Lowest price' },
  { id: 'priceDesc', label: 'Highest price' },
  { id: 'newest', label: 'Newest' },
];

export default function FilterSheet({
  visible,
  onClose,
  onApply,
  initial = {},
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [categoryIds, setCategoryIds] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    if (!visible) return;
    setCategoryIds(initial.categoryIds || []);
    setPriceMin(initial.priceMin ? String(initial.priceMin) : '');
    setPriceMax(initial.priceMax ? String(initial.priceMax) : '');
    setSortBy(initial.sortBy || 'rating');
  }, [visible]);

  const toggleCategory = (id) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleReset = () => {
    setCategoryIds([]);
    setPriceMin('');
    setPriceMax('');
    setSortBy('rating');
  };

  const handleApply = () => {
    onApply({
      categoryIds,
      priceMin: priceMin ? Number(priceMin) : null,
      priceMax: priceMax ? Number(priceMax) : null,
      sortBy,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <Text style={styles.label}>Categories</Text>
            <View style={styles.chipWrap}>
              {CATEGORIES.map((c) => {
                const active = categoryIds.includes(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleCategory(c.id)}
                  >
                    <Ionicons
                      name={c.icon}
                      size={14}
                      color={active ? PALETTE.black : c.iconColor}
                    />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Price range (PKR)</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                value={priceMin}
                onChangeText={setPriceMin}
                placeholder="Min"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              <Text style={styles.rangeDash}>—</Text>
              <TextInput
                style={styles.input}
                value={priceMax}
                onChangeText={setPriceMax}
                placeholder="Max"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.label}>Sort by</Text>
            <View style={styles.chipWrap}>
              {SORT_OPTIONS.map((s) => {
                const active = sortBy === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setSortBy(s.id)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyText}>Apply filters</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 18,
      maxHeight: '88%',
    },
    handle: {
      alignSelf: 'center',
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    resetText: {
      ...FONTS.small,
      color: PALETTE.golden,
      fontWeight: '700',
    },
    label: {
      ...FONTS.small,
      color: colors.textSecondary,
      marginTop: 16,
      marginBottom: 8,
      fontWeight: '600',
    },
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipActive: {
      backgroundColor: PALETTE.golden,
      borderColor: PALETTE.golden,
    },
    chipText: {
      ...FONTS.small,
      color: colors.text,
      fontWeight: '600',
    },
    chipTextActive: {
      color: PALETTE.black,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    input: {
      ...FONTS.body,
      flex: 1,
      color: colors.text,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    rangeDash: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    applyBtn: {
      marginTop: 14,
      height: 52,
      borderRadius: 26,
      backgroundColor: PALETTE.golden,
      alignItems: 'center',
      justifyContent: 'center',
    },
    applyText: {
      color: PALETTE.black,
      fontSize: 16,
      fontWeight: '700',
    },
  });
