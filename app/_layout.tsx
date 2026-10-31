import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useLoadFonts } from '../constants/fonts';
import { AuthProvider } from '../providers/AuthProvider';
import { HalakatDialogHost } from '../components/HalakatDialog';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useLoadFonts();

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 5000);

    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      clearTimeout(fallbackTimer);
    }

    return () => clearTimeout(fallbackTimer);
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
      <HalakatDialogHost />
    </AuthProvider>
  );
}
