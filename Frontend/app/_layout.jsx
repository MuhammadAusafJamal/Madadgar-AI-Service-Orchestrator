import { useEffect, useMemo, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '@/src/theme';
import SplashScreenVideo from '@/src/components/SplashScreenVideo';
import OnboardingContainer from '@/src/screens/OnboardingContainer';
import { AuthProvider } from '@/src/context/AuthContext';
import { FavouritesProvider } from '@/src/context/FavouritesContext';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const [splashFinished, setSplashFinished] = useState(false);
  const [onboardingFinished, setOnboardingFinished] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <FavouritesProvider>
          <SafeAreaProvider>
            {!splashFinished ? (
              <>
                <StatusBar hidden />
                <SplashScreenVideo
                  source={require('../assets/videos/splash.mp4')}
                  onFinish={() => setSplashFinished(true)}
                />
              </>
            ) : !onboardingFinished ? (
              <>
                <StatusBar style="light" backgroundColor="#000000" />
                <OnboardingContainer onFinish={() => setOnboardingFinished(true)} />
              </>
            ) : (
              <RootLayoutNav />
            )}
          </SafeAreaProvider>
        </FavouritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { dark, colors } = useTheme();

  const navTheme = useMemo(() => {
    const base = dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        primary: colors.primary,
        border: colors.border,
        notification: colors.accent,
      },
    };
  }, [dark, colors]);

  return (
    <NavThemeProvider value={navTheme}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </NavThemeProvider>
  );
}
