import 'react-native-gesture-handler';
import { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from './src/theme/ThemeProvider';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import OnboardingContainer from './src/screens/OnboardingContainer';
import { SplashScreenVideoStyles } from './src/components/SplashScreenVideo/style';
import SplashScreenVideo from './src/components/SplashScreenVideo';

LogBox.ignoreAllLogs();

SplashScreen.preventAutoHideAsync().catch(() => { });

export default function App() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [isOnboardingFinished, setIsOnboardingFinished] = useState(false);

  const splashScreenTimeout = () => {
    setTimeout(() => {
      setIsSplashFinished(true)
    }, 20000)
  }

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => { });
  }, []);

  let stage;
  if (!isSplashFinished) {
    stage = (
      <>
        <StatusBar hidden />
        <SplashScreenVideo onFinish={splashScreenTimeout} />
      </>
    );
  } else if (!isOnboardingFinished) {
    stage = (
      <>
        <StatusBar backgroundColor="#000000" barStyle="light-content" />
        <OnboardingContainer onFinish={() => setIsOnboardingFinished(true)} />
      </>
    );
  } else {
    stage = (
      <>
        <StatusBar backgroundColor="#000000" barStyle="light-content" />
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>{stage}</SafeAreaProvider>
    </ThemeProvider>
  );
}