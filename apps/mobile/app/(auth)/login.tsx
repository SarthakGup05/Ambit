import React, { useState } from "react";
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, TextInput, ActivityIndicator, Text as RNText } from "react-native";
import { Screen, Text, Button } from "@repo/ui";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/features/auth/hooks/useAuth";
import { Lock, Mail, Eye, EyeOff, Apple, User } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import Animated, { FadeInUp } from "react-native-reanimated";

// Custom Google Icon
function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" style={styles.socialIcon}>
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </Svg>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError(null);

    try {
      await login(email, password);
      router.replace("/");
    } catch (err: any) {
      // Error is handled in the useAuth hook
    }
  };

  const activeError = error || authError;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Clean minimalist white background */}
      <View style={styles.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Screen className="bg-transparent" scrollable={false}>
            
            {/* Header section */}
            <View style={styles.headerSection}>
              <Animated.View entering={FadeInUp.duration(500)}>
                <Text style={styles.title}>Login</Text>
              </Animated.View>
            </View>

            {/* Error handling */}
            {activeError && (
              <Animated.View entering={FadeInUp.duration(400)} style={styles.errorBox}>
                <Text style={styles.errorText}>{activeError}</Text>
              </Animated.View>
            )}

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  style={styles.input}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                  style={styles.input}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </Pressable>
              </View>

              {/* Forgot Password */}
              <Pressable style={styles.forgotBtn} onPress={() => {}}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>

              {/* Forest Green Login Button */}
              <Pressable 
                onPress={handleLogin}
                disabled={isLoading}
                className="w-full h-[52px] rounded-[26px] bg-[#11111E] active:bg-[#2E2E3A] justify-center items-center mt-2"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <RNText className="text-white font-bold text-[15px]">Login</RNText>
                )}
              </Pressable>
            </View>

            {/* "or" Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialGroup}>
              <Pressable style={styles.socialBtn} onPress={() => {}}>
                <GoogleIcon />
                <Text style={styles.socialBtnText}>Continue with Google</Text>
              </Pressable>

              <Pressable style={styles.appleBtn} onPress={() => {}}>
                <Apple size={18} color="#FFFFFF" style={styles.socialIcon} />
                <Text style={styles.appleBtnText}>Continue with Apple</Text>
              </Pressable>

              <Pressable style={styles.socialBtn} onPress={() => router.replace("/")}>
                <User size={18} color="#11111E" style={styles.socialIcon} />
                <Text style={styles.socialBtnText}>Continue As Guest</Text>
              </Pressable>
            </View>

            {/* Sign Up Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Need an account? </Text>
              <Pressable onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.signUpLink}>Sign up</Text>
              </Pressable>
            </View>

          </Screen>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  headerSection: {
    marginBottom: 36,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#11111E",
    fontFamily: "ManropeBold",
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontFamily: "InterMedium",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    gap: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#11111E",
    fontFamily: "Inter",
  },
  eyeBtn: {
    padding: 4,
  },
  forgotBtn: {
    alignSelf: "center",
    marginVertical: 12,
  },
  forgotText: {
    fontSize: 13,
    color: "#5E5D6A",
    fontFamily: "InterSemiBold",
    textDecorationLine: "underline",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#F4F4F5",
  },
  dividerText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontFamily: "Inter",
    paddingHorizontal: 12,
  },
  socialGroup: {
    width: "100%",
    gap: 12,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F4F4F5",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11111E",
    fontFamily: "InterSemiBold",
  },
  appleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 24,
    backgroundColor: "#A8D1A9",
  },
  appleBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "InterSemiBold",
  },
  socialIcon: {
    marginRight: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#5E5D6A",
    fontFamily: "Inter",
  },
  signUpLink: {
    fontSize: 14,
    color: "#2E7D32",
    fontFamily: "InterBold",
    fontWeight: "bold",
  },
  loginBtn: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: "#11111E",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loginBtnPressed: {
    backgroundColor: "#2E2E3A",
  },
  loginBtnText: {
    fontSize: 15,
    fontFamily: "InterBold",
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
