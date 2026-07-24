import "../global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Manrope_400Regular, Manrope_500Medium, Manrope_700Bold } from "@expo-google-fonts/manrope";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { useEffect, useState } from "react";
import { useAuth } from "../src/features/auth/hooks/useAuth";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RoleSwitcherBar, ToastProvider, SplashScreen } from "../src/components/common";
import { registerForPushNotificationsAsync, setupNotificationListeners } from "../src/services/notifications/PushNotificationSetup";
import * as ExpoSplashScreen from 'expo-splash-screen';

// Prevent the native splash screen from hiding automatically until our custom JS splash screen is ready
ExpoSplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if it's already preventing
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope: Manrope_400Regular,
    ManropeMedium: Manrope_500Medium,
    ManropeBold: Manrope_700Bold,
    Inter: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });

  const { initializeAuth } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSplashAnimationComplete, setIsSplashAnimationComplete] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      try {
        await initializeAuth();
        // Register push token after restoring session
        registerForPushNotificationsAsync().catch((err) =>
          console.error("Push notification setup failed:", err)
        );
      } catch (err) {
        console.error("Failed to restore session on boot", err);
      } finally {
        setIsInitializing(false);
      }
    }
    restoreSession();

    const cleanup = setupNotificationListeners();
    return () => cleanup();
  }, [initializeAuth]);

  const isReady = fontsLoaded && !isInitializing;

  return (
    <SafeAreaProvider>
      <ToastProvider>
        {isReady && (
          <>
            <Stack screenOptions={{ headerShown: false }} />
            <RoleSwitcherBar />
          </>
        )}
      </ToastProvider>
      {!isSplashAnimationComplete && (
        <SplashScreen 
          isReady={isReady} 
          onAnimationComplete={() => setIsSplashAnimationComplete(true)} 
        />
      )}
    </SafeAreaProvider>
  );
}
