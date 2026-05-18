import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme';
import { makeStyles } from './RoleSelectionScreen.styles';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brand}>
          <Image
            source={require('@/assets/images/madadgar_favicon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>How would you like to use the app?</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() => router.push('/(auth)/signup-taker')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="search" size={28} color={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>I Want a Service</Text>
            <Text style={styles.cardDesc}>
              Find professionals like plumbers, electricians, or tutors near you.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() => router.push('/(auth)/signup-provider')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="briefcase" size={28} color={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>I Provide Services</Text>
            <Text style={styles.cardDesc}>
              Offer your skills and connect with customers in your area.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
