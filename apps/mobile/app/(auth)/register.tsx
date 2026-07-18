import React, { useState } from "react";
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, TextInput, ActivityIndicator, Text as RNText } from "react-native";
import { Screen, Text } from "@repo/ui";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/features/auth/hooks/useAuth";
import { Lock, Mail, User, Eye, EyeOff, Apple, Key, ShieldCheck } from "lucide-react-native";
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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error: authError } = useAuth();
  
  const [signupMode, setSignupMode] = useState<"admin" | "invite">("admin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [targetRole, setTargetRole] = useState<"resident" | "guard">("resident");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (signupMode === "invite" && (!inviteCode || inviteCode.trim().length < 3)) {
      setError("Please enter a valid Society Invite Code");
      return;
    }
    setError(null);

    try {
      const assignedRole = signupMode === "admin" ? "admin" : targetRole;
      const cleanInvite = signupMode === "invite" ? inviteCode.trim().toUpperCase() : undefined;
      await register(name.trim(), email.trim(), password, assignedRole, cleanInvite);
      router.replace("/");
    } catch (err: any) {
      // Handled by hook
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
                <Text style={styles.title}>Get Started</Text>
              </Animated.View>
            </View>

            {/* Mode Switcher Tabs */}
            <View style={styles.modeTabRow}>
              <Pressable
                style={[styles.modeTab, signupMode === "admin" && styles.modeTabActive]}
                onPress={() => {
                  setSignupMode("admin");
                  setError(null);
                }}
              >
                <RNText style={[styles.modeTabText, signupMode === "admin" && styles.modeTabTextActive]}>
                  Society Admin
                </RNText>
              </Pressable>
              <Pressable
                style={[styles.modeTab, signupMode === "invite" && styles.modeTabActive]}
                onPress={() => {
                  setSignupMode("invite");
                  setError(null);
                }}
              >
                <RNText style={[styles.modeTabText, signupMode === "invite" && styles.modeTabTextActive]}>
                  Join via Invite Code
                </RNText>
              </Pressable>
            </View>

            {/* Mode Description Subtitle */}
            <Text style={styles.modeDescription}>
              {signupMode === "admin"
                ? "Register as a Society Admin to create and manage your society boundary."
                : "Enter the Invite Code provided by your society admin to join your community."}
            </Text>

            {/* Error handling */}
            {activeError && (
              <Animated.View entering={FadeInUp.duration(400)} style={styles.errorBox}>
                <Text style={styles.errorText}>{activeError}</Text>
              </Animated.View>
            )}

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Invite Code Input (Only in Invite Mode) */}
              {signupMode === "invite" && (
                <Animated.View entering={FadeInUp.duration(300)}>
                  <View style={[styles.inputWrapper, styles.inviteCodeWrapper]}>
                    <Key size={20} color="#2E7D32" style={styles.inputIcon} />
                    <TextInput
                      placeholder="INVITE CODE (e.g. AMBIT123)"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="characters"
                      value={inviteCode}
                      onChangeText={(text) => {
                        setInviteCode(text.toUpperCase());
                        setError(null);
                      }}
                      style={[styles.input, styles.inviteCodeInput]}
                    />
                  </View>
                </Animated.View>
              )}

              {/* Full Name Input */}
              <View style={styles.inputWrapper}>
                <User size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setError(null);
                  }}
                  style={styles.input}
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
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
                  placeholder="Password (min. 6 characters)"
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

              {/* Role Selection (Only in Invite Mode) */}
              {signupMode === "invite" && (
                <Animated.View entering={FadeInUp.duration(300)} style={styles.roleSelectorContainer}>
                  <Text style={styles.roleLabel}>I am joining as a:</Text>
                  <View style={styles.roleButtonsRow}>
                    <Pressable
                      style={[
                        styles.roleButton,
                        targetRole === "resident" && styles.roleButtonActive,
                      ]}
                      onPress={() => setTargetRole("resident")}
                    >
                      <RNText
                        style={[
                          styles.roleButtonText,
                          targetRole === "resident" && styles.roleButtonTextActive,
                        ]}
                      >
                        Resident
                      </RNText>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.roleButton,
                        targetRole === "guard" && styles.roleButtonActive,
                      ]}
                      onPress={() => setTargetRole("guard")}
                    >
                      <RNText
                        style={[
                          styles.roleButtonText,
                          targetRole === "guard" && styles.roleButtonTextActive,
                        ]}
                      >
                        Security Guard
                      </RNText>
                    </Pressable>
                  </View>
                </Animated.View>
              )}

              {/* Action Button */}
              <Pressable 
                onPress={handleSignUp}
                disabled={isLoading}
                style={styles.submitBtn}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <RNText style={styles.submitBtnText}>
                    {signupMode === "admin" ? "Create Admin Account" : "Join Society"}
                  </RNText>
                )}
              </Pressable>
            </View>

            {/* Sign In Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.loginLink}>Log in</Text>
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
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#11111E",
    fontFamily: "ManropeBold",
  },
  modeTabRow: {
    flexDirection: "row",
    backgroundColor: "#F4F4F5",
    borderRadius: 24,
    padding: 4,
    marginBottom: 12,
  },
  modeTab: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modeTabActive: {
    backgroundColor: "#11111E",
  },
  modeTabText: {
    fontSize: 13,
    fontFamily: "InterSemiBold",
    fontWeight: "600",
    color: "#71717A",
  },
  modeTabTextActive: {
    color: "#FFFFFF",
  },
  modeDescription: {
    fontSize: 12.5,
    fontFamily: "Inter",
    color: "#71717A",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
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
    gap: 14,
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
  inviteCodeWrapper: {
    borderColor: "#2E7D32",
    backgroundColor: "rgba(46, 125, 50, 0.04)",
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
  inviteCodeInput: {
    fontFamily: "InterBold",
    fontWeight: "bold",
    letterSpacing: 1.5,
    color: "#2E7D32",
  },
  eyeBtn: {
    padding: 4,
  },
  roleSelectorContainer: {
    marginVertical: 4,
    gap: 8,
  },
  roleLabel: {
    fontSize: 13,
    color: "#5E5D6A",
    fontFamily: "InterSemiBold",
  },
  roleButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  roleButtonActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  roleButtonText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#5E5D6A",
    fontFamily: "InterSemiBold",
  },
  roleButtonTextActive: {
    color: "#FFFFFF",
  },
  submitBtn: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: "#11111E",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontFamily: "InterBold",
    fontWeight: "bold",
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
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
  loginLink: {
    fontSize: 14,
    color: "#2E7D32",
    fontFamily: "InterBold",
    fontWeight: "bold",
  },
});
