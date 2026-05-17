import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-native-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { registerUser } from '../../services/authService';
import { uploadFile } from '../../services/uploadService';

const providerSchema = z.object({
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

const CATEGORIES = ['Plumber', 'Electrician', 'AC Technician', 'Beautician', 'Tutor', 'Wall Painter', 'Carpenter'];

export const ProviderSignupScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // Files state
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState('');

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      fullName: '', email: '', password: '', phone: '', cnic: '', address: '',
      category: '', experience: '', description: '',
    }
  });

  const selectedCategory = watch('category');
  const needsDegree = selectedCategory === 'Tutor';
  const needsWorkImages = CATEGORIES.filter(c => c !== 'Tutor').includes(selectedCategory);

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'] });
    if (!result.canceled && result.assets.length > 0) {
      setSelectedDocs([...selectedDocs, result.assets[0]]);
    }
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImages([...selectedImages, ...result.assets]);
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
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
    setUploadProgress('Uploading files...');

    try {
      const documentUrls = [];
      const workImagesUrls = [];

      for (let doc of selectedDocs) {
        const url = await uploadFile(doc.uri, 'provider_documents');
        documentUrls.push(url);
      }

      for (let img of selectedImages) {
        const url = await uploadFile(img.uri, 'provider_work_images');
        workImagesUrls.push(url);
      }

      setUploadProgress('Creating account...');
      const { email, password, ...additionalData } = data;
      await registerUser(email, password, 'provider', {
        ...additionalData,
        documentUrls,
        workImages: workImagesUrls,
      });
      // Auth Context will handle navigation
    } catch (err) {
      setServerError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#232323" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Become a Provider</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} placeholder="John Doe" value={value} onChangeText={onChange} />
            )} />
            {errors.fullName && <Text style={styles.fieldError}>{errors.fullName.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} />
            )} />
            {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} placeholder="Secret password" secureTextEntry value={value} onChangeText={onChange} />
            )} />
            {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Phone Number</Text>
              <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
                <TextInput style={styles.input} placeholder="0300 1234567" keyboardType="phone-pad" value={value} onChangeText={onChange} />
              )} />
              {errors.phone && <Text style={styles.fieldError}>{errors.phone.message}</Text>}
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>CNIC Number</Text>
              <Controller control={control} name="cnic" render={({ field: { onChange, value } }) => (
                <TextInput style={styles.input} placeholder="12345-1234567-1" keyboardType="number-pad" value={value} onChangeText={onChange} />
              )} />
              {errors.cnic && <Text style={styles.fieldError}>{errors.cnic.message}</Text>}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <Controller control={control} name="address" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} placeholder="House, Street, City" value={value} onChangeText={onChange} />
            )} />
            {errors.address && <Text style={styles.fieldError}>{errors.address.message}</Text>}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Professional Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Category</Text>
            <View style={styles.chipContainer}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.chip, selectedCategory === cat && styles.chipSelected]}
                  onPress={() => setValue('category', cat)}
                >
                  <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextSelected]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.category && <Text style={styles.fieldError}>{errors.category.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Years of Experience</Text>
            <Controller control={control} name="experience" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} placeholder="e.g., 5" keyboardType="numeric" value={value} onChangeText={onChange} />
            )} />
            {errors.experience && <Text style={styles.fieldError}>{errors.experience.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Description</Text>
            <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, styles.textArea]} placeholder="Describe your expertise and services..." multiline numberOfLines={4} value={value} onChangeText={onChange} />
            )} />
            {errors.description && <Text style={styles.fieldError}>{errors.description.message}</Text>}
          </View>

          {selectedCategory ? (
            <View style={styles.uploadSection}>
              <Text style={styles.sectionTitle}>Required Documents</Text>
              
              {needsDegree && (
                <View style={styles.uploadBox}>
                  <Text style={styles.uploadLabel}>Upload Degree / Certification (PDF/Image)</Text>
                  <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
                    <Ionicons name="document-attach" size={24} color="#46C96B" />
                    <Text style={styles.uploadBtnText}>Select Document</Text>
                  </TouchableOpacity>
                  {selectedDocs.map((doc, idx) => (
                    <Text key={idx} style={styles.fileName}>✓ {doc.name || 'Document uploaded'}</Text>
                  ))}
                </View>
              )}

              {needsWorkImages && (
                <View style={styles.uploadBox}>
                  <Text style={styles.uploadLabel}>Upload Recent Work Images</Text>
                  <TouchableOpacity style={styles.uploadBtn} onPress={pickImages}>
                    <Ionicons name="images" size={24} color="#46C96B" />
                    <Text style={styles.uploadBtnText}>Select Images</Text>
                  </TouchableOpacity>
                  <View style={styles.imagePreviewContainer}>
                    {selectedImages.map((img, idx) => (
                      <View key={idx} style={styles.previewWrapper}>
                        <Image source={{ uri: img.uri }} style={styles.previewImg} />
                        <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(idx)}>
                          <Ionicons name="close-circle" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : null}

          <TouchableOpacity style={styles.signupBtn} onPress={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingTextBtn}>{uploadProgress}</Text>
              </View>
            ) : (
              <Text style={styles.signupBtnText}>Complete Registration</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#232323' },
  scrollContent: { padding: 24, paddingBottom: 60 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#232323', marginBottom: 16 },
  errorText: { color: '#FF3B30', marginBottom: 16, fontSize: 14, backgroundColor: '#FFEBEA', padding: 12, borderRadius: 8 },
  fieldError: { color: '#FF3B30', fontSize: 12, marginTop: 4 },
  inputGroup: { marginBottom: 20 },
  row: { flexDirection: 'row' },
  label: { fontSize: 14, fontWeight: '600', color: '#232323', marginBottom: 8 },
  input: { backgroundColor: '#F1F5F2', borderRadius: 16, padding: 16, fontSize: 16, color: '#232323' },
  textArea: { height: 100, paddingTop: 16, textAlignVertical: 'top' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F1F5F2', borderWidth: 1, borderColor: '#E5E5E5' },
  chipSelected: { backgroundColor: '#46C96B', borderColor: '#46C96B' },
  chipText: { fontSize: 14, color: '#8E8E8E', fontWeight: '500' },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  uploadSection: { marginTop: 16, marginBottom: 24, padding: 20, backgroundColor: '#FAFAFA', borderRadius: 24, borderWidth: 1, borderColor: '#F2F2F2' },
  uploadBox: { marginBottom: 16 },
  uploadLabel: { fontSize: 14, fontWeight: '600', color: '#232323', marginBottom: 12 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9F8EE', padding: 16, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#46C96B' },
  uploadBtnText: { color: '#46C96B', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  fileName: { marginTop: 8, fontSize: 13, color: '#46C96B', fontWeight: '500' },
  imagePreviewContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 12 },
  previewWrapper: { position: 'relative' },
  previewImg: { width: 70, height: 70, borderRadius: 12 },
  removeImgBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: '#FFF', borderRadius: 10 },
  signupBtn: { backgroundColor: '#46C96B', borderRadius: 16, padding: 18, alignItems: 'center', shadowColor: '#46C96B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  signupBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  loadingTextBtn: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginLeft: 8 }
});
