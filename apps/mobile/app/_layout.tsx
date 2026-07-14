import "../global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Manrope_400Regular, Manrope_700Bold } from "@expo-google-fonts/manrope";
import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope: Manrope_400Regular,
    ManropeBold: Manrope_700Bold,
    Inter: Inter_400Regular,
    InterBold: Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

