import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CATEGORIES } from '@/src/constants/categories';
import { useAuth } from '@/src/context/AuthContext';
import { addService } from '@/src/services/serviceService';
import { uploadFile } from '@/src/services/uploadService';
import { FONTS, PALETTE, useTheme } from '@/src/theme';

const PRICE_UNITS = ['visit', 'per unit', 'per hour', 'per month', 'event', 'starting'];

export default function CreateServiceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, role } = useAuth();
  const styles = makeStyles(colors);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('visit');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [highlightsText, setHighlightsText] = useState('');

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (role !== 'provider') {
    return (
      <SafeAreaView style={styles.area} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <Text style={styles.label}>Only providers can create services.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pickImage = async () => {
    if (uploading) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 2],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    setUploading(true);
    try {
      const url = await uploadFile(result.assets[0].uri, 'service_images');
      setImage(url);
    } catch (e) {
      Alert.alert('Upload failed', e?.message || 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    if (!title.trim()) return Alert.alert('Missing', 'Title is required.');
    if (!description.trim()) return Alert.alert('Missing', 'Description is required.');
    if (!categoryId) return Alert.alert('Missing', 'Pick a category.');
    if (!basePrice || isNaN(Number(basePrice))) {
      return Alert.alert('Missing', 'Enter a valid base price.');
    }

    const highlights = highlightsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      const id = await addService(user.uid, {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        basePrice: Number(basePrice),
        priceUnit,
        duration: duration.trim(),
        location: location.trim(),
        image: image || `https://picsum.photos/seed/${Date.now()}/600/400`,
        highlights,
      });
      Alert.alert('Published', 'Your service is now live.', [
        {
          text: 'View it',
          onPress: () =>
            router.replace({ pathname: '/service/[id]', params: { id } }),
        },
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Save failed', e?.message || 'Could not publish.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.area} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Service</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={pickImage}
            disabled={uploading}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
            ) : uploading ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
                <Text style={styles.imageHint}>Tap to add a cover image</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.form}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Split AC servicing"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="What's included? How does it work?"
              placeholderTextColor={colors.textSecondary}
              multiline
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.chipWrap}>
              {CATEGORIES.map((c) => {
                const active = categoryId === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setCategoryId(c.id)}
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

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Base price (PKR)</Text>
                <TextInput
                  style={styles.input}
                  value={basePrice}
                  onChangeText={setBasePrice}
                  placeholder="2500"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Price unit</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.unitScroller}
                >
                  {PRICE_UNITS.map((u) => {
                    const active = priceUnit === u;
                    return (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitChip, active && styles.unitChipActive]}
                        onPress={() => setPriceUnit(u)}
                      >
                        <Text
                          style={[
                            styles.unitChipText,
                            active && styles.unitChipTextActive,
                          ]}
                        >
                          {u}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <Text style={styles.label}>Duration</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g. 2 hrs, 3-5 days"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Location / service area</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Karachi"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Highlights (one per line)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={highlightsText}
              onChangeText={setHighlightsText}
              placeholder={'Licensed technician\n30-day warranty\nTools included'}
              placeholderTextColor={colors.textSecondary}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={PALETTE.black} />
            ) : (
              <Text style={styles.saveText}>Publish service</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    area: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    headerTitle: {
      ...FONTS.bodyMedium,
      color: colors.text,
      fontWeight: '700',
    },
    imagePicker: {
      marginHorizontal: 16,
      height: 180,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    image: { width: '100%', height: '100%' },
    imagePlaceholder: { alignItems: 'center', gap: 6 },
    imageHint: {
      ...FONTS.small,
      color: colors.textSecondary,
    },
    form: { paddingHorizontal: 16, marginTop: 8 },
    label: {
      ...FONTS.small,
      color: colors.textSecondary,
      marginBottom: 6,
      marginTop: 14,
      fontWeight: '600',
    },
    input: {
      ...FONTS.body,
      color: colors.text,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    textarea: { minHeight: 90, textAlignVertical: 'top' },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
    chipActive: { backgroundColor: PALETTE.golden, borderColor: PALETTE.golden },
    chipText: { ...FONTS.small, color: colors.text, fontWeight: '600' },
    chipTextActive: { color: PALETTE.black },
    row: { flexDirection: 'row' },
    unitScroller: { marginTop: 0 },
    unitChip: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 6,
      backgroundColor: colors.surface,
    },
    unitChipActive: { backgroundColor: PALETTE.golden, borderColor: PALETTE.golden },
    unitChipText: { ...FONTS.small, color: colors.text, fontWeight: '600' },
    unitChipTextActive: { color: PALETTE.black },
    saveBtn: {
      marginTop: 24,
      marginHorizontal: 16,
      height: 52,
      borderRadius: 26,
      backgroundColor: PALETTE.golden,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveText: { color: PALETTE.black, fontSize: 16, fontWeight: '700' },
  });
