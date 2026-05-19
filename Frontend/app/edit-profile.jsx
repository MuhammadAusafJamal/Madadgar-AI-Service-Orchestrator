import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import {
  getUserProfile,
  updateUserProfile,
} from '@/src/services/authService';
import { uploadFile } from '@/src/services/uploadService';
import { FONTS, PALETTE, useTheme } from '@/src/theme';

const FALLBACK_AVATAR = 'https://i.pravatar.cc/200?u=madadgar-default';

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, role } = useAuth();
  const isProvider = role === 'provider';
  const styles = makeStyles(colors);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!user?.uid || !role) {
      setLoading(false);
      return;
    }
    getUserProfile(user.uid, role)
      .then((data) => {
        if (cancelled || !data) return;
        setFullName(data.fullName || '');
        setPhone(data.phone || '');
        setBio(data.bio || '');
        setProfilePic(data.profilePic || '');
        setCategoryId(data.categoryId || '');
        if (Array.isArray(data.serviceAreas)) {
          setServiceAreas(data.serviceAreas.join(', '));
        } else if (data.serviceAreas) {
          setServiceAreas(String(data.serviceAreas));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.uid, role]);

  const pickProfilePic = async () => {
    if (uploading) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    setUploading(true);
    try {
      const url = await uploadFile(result.assets[0].uri, 'profile_pics');
      setProfilePic(url);
    } catch (e) {
      Alert.alert('Upload failed', e?.message || 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    if (!fullName.trim()) {
      Alert.alert('Validation', 'Full name is required.');
      return;
    }
    setSaving(true);
    const areas = serviceAreas
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const updates = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      profilePic: profilePic || null,
    };
    if (isProvider) {
      updates.categoryId = categoryId || null;
      updates.serviceAreas = areas;
      updates.rating = 0;
      updates.reviewCount = 0;
      updates.completedJobs = 0;
    }
    try {
      await updateUserProfile(user.uid, role, updates);
      Alert.alert('Saved', 'Profile updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Save failed', e?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.area} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: profilePic || FALLBACK_AVATAR }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.avatarOverlay}
              onPress={pickProfilePic}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={PALETTE.white} />
              ) : (
                <Ionicons name="camera-outline" size={22} color={PALETTE.white} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+92 300 1234567"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={bio}
              onChangeText={setBio}
              placeholder={
                isProvider
                  ? 'Describe your experience and what you do best'
                  : 'A short bio (optional)'
              }
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />

            {isProvider && (
              <>
                <Text style={styles.label}>Service category</Text>
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
                        <Text
                          style={[styles.chipText, active && styles.chipTextActive]}
                        >
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.label}>Service areas (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  value={serviceAreas}
                  onChangeText={setServiceAreas}
                  placeholder="Karachi, Hyderabad"
                  placeholderTextColor={colors.textSecondary}
                />
              </>
            )}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={PALETTE.black} />
            ) : (
              <Text style={styles.saveText}>Save changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    area: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
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
    avatarWrap: {
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 18,
    },
    avatar: {
      width: 110,
      height: 110,
      borderRadius: 55,
    },
    avatarOverlay: {
      position: 'absolute',
      bottom: 0,
      right: '32%',
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: PALETTE.golden,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    form: {
      paddingHorizontal: 16,
    },
    label: {
      ...FONTS.small,
      color: colors.textSecondary,
      marginBottom: 6,
      marginTop: 12,
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
    textarea: {
      minHeight: 90,
      textAlignVertical: 'top',
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
    saveBtn: {
      marginTop: 24,
      marginHorizontal: 16,
      height: 52,
      borderRadius: 26,
      backgroundColor: PALETTE.golden,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveText: {
      color: PALETTE.black,
      fontSize: 16,
      fontWeight: '700',
    },
  });
