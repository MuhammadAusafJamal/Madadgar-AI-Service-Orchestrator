import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';

import Input from '@/src/components/Input';
import { registerUser } from '@/src/services/authService';
import { uploadFile } from '@/src/services/uploadService';
import { useTheme } from '@/src/theme';
import { makeStyles } from './ProviderSignupScreen.styles';

const CATEGORIES = [
  'Plumber',
  'Electrician',
  'AC Technician',
  'Beautician',
  'Tutor',
  'Wall Painter',
  'Carpenter',
];

const schema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  cnic: z.string().min(13, 'Valid CNIC is required'),
  address: z.string().min(5, 'Address is required'),
  category: z.string().min(2, 'Service category is required'),
  experience: z.string().min(1, 'Experience is required'),
  description: z.string().min(10, 'Description is required'),
});

export default function ProviderSignupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      cnic: '',
      address: '',
      category: '',
      experience: '',
      description: '',
    },
  });

  const selectedCategory = watch('category');
  const needsDegree = selectedCategory === 'Tutor';
  const needsWorkImages =
    selectedCategory && CATEGORIES.filter((c) => c !== 'Tutor').includes(selectedCategory);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
    });
    if (!result.canceled && result.assets?.length > 0) {
      setSelectedDocs((prev) => [...prev, result.assets[0]]);
    }
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImages((prev) => [...prev, ...result.assets]);
    }
  };

  const removeImage = (idx) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data) => {
    if (needsDegree && selectedDocs.length === 0) {
      setServerError('Please upload your Degree / Certification.');
      return;
    }
    if (needsWorkImages && selectedImages.length === 0) {
      setServerError('Please upload at least one recent work image.');
      return;
    }

    setLoading(true);
    setServerError('');
    setUploadProgress('Uploading files…');

    try {
      const documentUrls = [];
      const workImagesUrls = [];

      for (const doc of selectedDocs) {
        const url = await uploadFile(doc.uri, 'provider_documents');
        documentUrls.push(url);
      }
      for (const img of selectedImages) {
        const url = await uploadFile(img.uri, 'provider_work_images');
        workImagesUrls.push(url);
      }

      setUploadProgress('Creating account…');
      const { email, password, ...additionalData } = data;
      await registerUser(email, password, 'provider', {
        ...additionalData,
        documentUrls,
        workImages: workImagesUrls,
      });
      router.replace('/(tabs)');
    } catch (err) {
      setServerError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Become a Provider</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

          <Text style={styles.sectionTitle}>Personal Information</Text>

          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={value}
                onChangeText={onChange}
                error={errors.fullName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Password"
                placeholder="Secret password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Phone Number"
                    placeholder="0300 1234567"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                    error={errors.phone?.message}
                  />
                )}
              />
            </View>
            <View style={styles.gap} />
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="cnic"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="CNIC Number"
                    placeholder="12345-1234567-1"
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={onChange}
                    error={errors.cnic?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Address"
                placeholder="House, Street, City"
                value={value}
                onChangeText={onChange}
                error={errors.address?.message}
              />
            )}
          />

          <Text style={[styles.sectionTitle, styles.sectionSpaced]}>
            Professional Information
          </Text>

          <Text style={styles.fieldLabel}>Service Category</Text>
          <View style={styles.chipContainer}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.85}
                  onPress={() => setValue('category', cat, { shouldValidate: true })}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.category && (
            <Text style={styles.fieldError}>{errors.category.message}</Text>
          )}

          <View style={{ height: 16 }} />

          <Controller
            control={control}
            name="experience"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Years of Experience"
                placeholder="e.g., 5"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                error={errors.experience?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Service Description"
                placeholder="Describe your expertise and services…"
                multiline
                value={value}
                onChangeText={onChange}
                error={errors.description?.message}
              />
            )}
          />

          {selectedCategory ? (
            <View style={styles.uploadSection}>
              <Text style={styles.sectionTitle}>Required Documents</Text>

              {needsDegree && (
                <View style={styles.uploadBlock}>
                  <Text style={styles.fieldLabel}>
                    Upload Degree / Certification (PDF/Image)
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.uploadBtn}
                    onPress={pickDocument}
                  >
                    <Ionicons name="document-attach" size={22} color={colors.primary} />
                    <Text style={styles.uploadBtnText}>Select Document</Text>
                  </TouchableOpacity>
                  {selectedDocs.map((doc, idx) => (
                    <Text key={idx} style={styles.fileName}>
                      ✓ {doc.name || 'Document uploaded'}
                    </Text>
                  ))}
                </View>
              )}

              {needsWorkImages && (
                <View style={styles.uploadBlock}>
                  <Text style={styles.fieldLabel}>Upload Recent Work Images</Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.uploadBtn}
                    onPress={pickImages}
                  >
                    <Ionicons name="images" size={22} color={colors.primary} />
                    <Text style={styles.uploadBtnText}>Select Images</Text>
                  </TouchableOpacity>
                  <View style={styles.imagePreviewContainer}>
                    {selectedImages.map((img, idx) => (
                      <View key={idx} style={styles.previewWrapper}>
                        <Image source={{ uri: img.uri }} style={styles.previewImg} />
                        <TouchableOpacity
                          style={styles.removeImgBtn}
                          onPress={() => removeImage(idx)}
                        >
                          <Ionicons name="close-circle" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>{uploadProgress}</Text>
              </View>
            ) : (
              <Text style={styles.primaryBtnText}>Complete Registration</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
