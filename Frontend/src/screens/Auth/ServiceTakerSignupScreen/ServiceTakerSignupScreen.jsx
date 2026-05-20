import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
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
import { getAuthErrorMessage, registerUser } from '@/src/services/authService';
import { useTheme } from '@/src/theme';
import { makeStyles } from './ServiceTakerSignupScreen.styles';

const schema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
});

export default function ServiceTakerSignupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '', phone: '', address: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const { email, password, ...additionalData } = data;
      await registerUser(email, password, 'service_taker', additionalData);
      router.replace('/(tabs)');
    } catch (err) {
      setServerError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Find trusted professionals nearby</Text>
          </View>

          {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

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
                label="Email Address"
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
                placeholder="Create a strong password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

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

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Full Address"
                placeholder="House, Street, City"
                multiline
                value={value}
                onChangeText={onChange}
                error={errors.address?.message}
              />
            )}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
