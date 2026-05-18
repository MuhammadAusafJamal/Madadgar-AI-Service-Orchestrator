import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form'; //NOTE - React Hook Form
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { registerUser } from '../../services/authService';

const takerSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
});

export const ServiceTakerSignupScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(takerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const { email, password, ...additionalData } = data;
      await registerUser(email, password, 'service_taker', additionalData);
      // Auth context will navigate
    } catch (err) {
      setServerError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#232323" />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Find trusted professionals nearby</Text>
          </View>

          <View style={styles.form}>
            {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={styles.input} placeholder="John Doe" value={value} onChangeText={onChange} />
                )}
              />
              {errors.fullName && <Text style={styles.fieldError}>{errors.fullName.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={styles.input} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} />
                )}
              />
              {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={styles.input} placeholder="Create a strong password" secureTextEntry value={value} onChangeText={onChange} />
                )}
              />
              {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={styles.input} placeholder="0300 1234567" keyboardType="phone-pad" value={value} onChangeText={onChange} />
                )}
              />
              {errors.phone && <Text style={styles.fieldError}>{errors.phone.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Address</Text>
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={[styles.input, styles.textArea]} placeholder="House, Street, City" multiline numberOfLines={3} value={value} onChangeText={onChange} />
                )}
              />
              {errors.address && <Text style={styles.fieldError}>{errors.address.message}</Text>}
            </View>

            <TouchableOpacity style={styles.signupBtn} onPress={handleSubmit(onSubmit)} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupBtnText}>Sign Up</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  backBtn: { marginTop: 16, marginBottom: 16, marginLeft: 24, width: 40, height: 40, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '800', color: '#232323', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#8E8E8E' },
  form: { flex: 1 },
  errorText: { color: '#FF3B30', marginBottom: 16, fontSize: 14 },
  fieldError: { color: '#FF3B30', fontSize: 12, marginTop: 4 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#232323', marginBottom: 8 },
  input: { backgroundColor: '#F1F5F2', borderRadius: 16, padding: 16, fontSize: 16, color: '#232323' },
  textArea: { height: 80, paddingTop: 16, textAlignVertical: 'top' },
  signupBtn: { backgroundColor: '#46C96B', borderRadius: 16, padding: 18, alignItems: 'center', shadowColor: '#46C96B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4, marginTop: 16 },
  signupBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 16, color: '#8E8E8E' },
  loginText: { fontSize: 16, color: '#46C96B', fontWeight: '700' }
});
