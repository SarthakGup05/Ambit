import "../global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Manrope_400Regular, Manrope_500Medium, Manrope_700Bold } from "@expo-google-fonts/manrope";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { useEffect, useState } from "react";
import { useAuth } from "../src/features/auth/hooks/useAuth";
import { RoleSwitcherBar } from "../src/components/common";

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

  useEffect(() => {
    async function restoreSession() {
      try {
        await initializeAuth();
      } catch (err) {
        console.error("Failed to restore session on boot", err);
      } finally {
        setIsInitializing(false);
      }
    }
    restoreSession();
  }, [initializeAuth]);

  if (!fontsLoaded || isInitializing) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <RoleSwitcherBar />
    </>
  );
}

