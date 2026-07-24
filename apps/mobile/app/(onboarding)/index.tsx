import React, { useState } from "react";
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, Clipboard } from "react-native";
import { Screen, Text, Input, Button } from "@repo/ui";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/auth.store";
import { api } from "../../src/lib/axios";
import { Home, Shield, ClipboardCopy, ArrowLeft, CheckCircle, ArrowRight } from "lucide-react-native";
import Animated, { FadeInLeft, FadeInRight, ZoomIn } from "react-native-reanimated";

type Step = "select-role" | "resident-form" | "admin-form" | "admin-success";

export default function OnboardingScreen() {
  const router = useRouter();
  const { token, user, setAuth } = useAuthStore();
  
  const [step, setStep] = useState<Step>(() => {
    if (user?.role === "admin") return "admin-form";
    if (user?.role === "resident") return "resident-form";
    return "select-role";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [inviteCode, setInviteCode] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [societyName, setSocietyName] = useState("");
  const [societyAddress, setSocietyAddress] = useState("");

  // Result state
  const [createdInviteCode, setCreatedInviteCode] = useState("");

  // Handle joining a society as resident
  const handleJoinSociety = async () => {
    if (!inviteCode || !flatNumber) {
      setError("Please fill in all fields");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/api/onboarding/resident", {
        inviteCode: inviteCode.trim().toUpperCase(),
        flatNumber: flatNumber.trim(),
      });

      const updatedUser = response.data.user;
      
      // Update global auth state with new user object
      setAuth(token, updatedUser);

      // Redirect using route config in index.tsx
      router.replace("/");
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to join society");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating a society as admin
  const handleCreateSociety = async () => {
    if (!societyName || !societyAddress) {
      setError("Please fill in all fields");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/api/onboarding/admin", {
        name: societyName.trim(),
        address: societyAddress.trim(),
      });

      const { society, user: updatedUser } = response.data;
      setCreatedInviteCode(society.inviteCode);
      
      // Update global auth state
      setAuth(token, updatedUser);

      // Go to success step to display invite code
      setStep("admin-success");
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to create society");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    Clipboard.setString(createdInviteCode);
    alert("Invite code copied to clipboard!");
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Premium background */}
      <LinearGradient
        colors={["#E8F5E9", "#F4F7F4", "#FAF8F5"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Screen className="bg-transparent" scrollable={false}>

            {/* Back Button (if not on first step or success step) */}
            {step !== "select-role" && step !== "admin-success" && (
              <Pressable 
                style={styles.backButton} 
                onPress={() => {
                  setStep("select-role");
                  setError(null);
                }}
              >
                <ArrowLeft size={20} color="#2E7D32" />
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
            )}

            {/* Main Switcher */}
            {step === "select-role" && (
              <Animated.View entering={FadeInLeft.duration(400)} style={styles.container}>
                <Text style={styles.title}>Welcome to Ambit</Text>
                <Text style={styles.subtitle}>Select your onboarding path to get started</Text>

                {/* Option 1: Resident */}
                <Pressable 
                  style={styles.roleCard}
                  onPress={() => setStep("resident-form")}
                >
                  <View style={styles.iconContainer}>
                    <Home size={28} color="#2E7D32" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text variant="h3" className="font-bold text-[#11111E]">Join as a Resident</Text>
                    <Text style={styles.cardDescription}>
                      Enter your society's invite code, select your flat number, and manage visitor entries.
                    </Text>
                  </View>
                </Pressable>

                {/* Option 2: Admin */}
                <Pressable 
                  style={[styles.roleCard, styles.roleCardAdmin]}
                  onPress={() => router.push("/(onboarding)/admin-setup")}
                >
                  <LinearGradient
                    colors={["#0F172A", "#1E293B"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={[styles.iconContainer, styles.iconContainerAdmin]}>
                    <Shield size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text variant="h3" style={styles.adminCardTitle}>Create a Society</Text>
                    <Text style={styles.adminCardDescription}>
                      Register a new society, configure towers, manage members, and set up guard portals.
                    </Text>
                    <View style={styles.adminCardTag}>
                      <Text style={styles.adminCardTagText}>Admin Setup Wizard  →</Text>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            )}

            {step === "resident-form" && (
              <Animated.View entering={FadeInRight.duration(400)} style={styles.container}>
                <Text style={styles.title}>Join Society</Text>
                <Text style={styles.subtitle}>Enter the details provided by your society management</Text>

                <View style={styles.formCard}>
                  {error && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Input
                      label="Invite Code"
                      placeholder="e.g. AMB824"
                      autoCapitalize="characters"
                      value={inviteCode}
                      onChangeText={(text) => {
                        setInviteCode(text);
                        setError(null);
                      }}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Input
                      label="Flat / Apartment Number"
                      placeholder="e.g. Tower A - 402"
                      value={flatNumber}
                      onChangeText={(text) => {
                        setFlatNumber(text);
                        setError(null);
                      }}
                    />
                  </View>

                  <Button
                    title="Confirm & Join"
                    isLoading={isLoading}
                    onPress={handleJoinSociety}
                    className="w-full mt-4"
                  />
                </View>
              </Animated.View>
            )}

            {step === "admin-form" && (
              <Animated.View entering={FadeInRight.duration(400)} style={styles.container}>
                <Text style={styles.title}>Register Society</Text>
                <Text style={styles.subtitle}>Establish your society boundary in Ambit SaaS</Text>

                <View style={styles.formCard}>
                  {error && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Input
                      label="Society Name"
                      placeholder="e.g. Green Meadows Residency"
                      value={societyName}
                      onChangeText={(text) => {
                        setSocietyName(text);
                        setError(null);
                      }}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Input
                      label="Society Address"
                      placeholder="e.g. 24th Main Road, Sector 5, Bangalore"
                      value={societyAddress}
                      onChangeText={(text) => {
                        setSocietyAddress(text);
                        setError(null);
                      }}
                    />
                  </View>

                  <Button
                    title="Create & Setup"
                    isLoading={isLoading}
                    onPress={handleCreateSociety}
                    className="w-full mt-4"
                  />
                </View>
              </Animated.View>
            )}

            {step === "admin-success" && (
              <Animated.View entering={ZoomIn.duration(500)} style={styles.successContainer}>
                <CheckCircle size={64} color="#2E7D32" style={styles.successIcon} />
                <Text style={styles.title}>Society Created!</Text>
                <Text style={styles.successSubtitle}>
                  Your society is registered. Share this invite code with residents to let them onboard.
                </Text>

                <View style={styles.codeCard}>
                  <Text style={styles.codeLabel}>INVITE CODE</Text>
                  <Text style={styles.codeText}>{createdInviteCode}</Text>
                  
                  <Pressable style={styles.copyButton} onPress={handleCopyCode}>
                    <ClipboardCopy size={16} color="#FFFFFF" />
                    <Text style={styles.copyButtonText}>Copy Code</Text>
                  </Pressable>
                </View>

                <Button
                  title="Go to Admin Dashboard"
                  onPress={() => router.replace("/")}
                  className="w-full mt-6"
                />
              </Animated.View>
            )}

          </Screen>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#11111E",
    textAlign: "center",
    fontFamily: "ManropeBold",
  },
  subtitle: {
    fontSize: 14,
    color: "#5E5D6A",
    textAlign: "center",
    fontFamily: "Inter",
    marginTop: 6,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  roleCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#71717A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },
  roleCardAdmin: {
    borderColor: "rgba(15, 23, 42, 0.15)",
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(46, 125, 50, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(46, 125, 50, 0.15)",
  },
  iconContainerAdmin: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  adminCardTitle: {
    fontSize: 16,
    fontFamily: "ManropeBold",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  adminCardDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "InterMedium",
    marginTop: 4,
    lineHeight: 16,
  },
  adminCardTag: {
    marginTop: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  adminCardTagText: {
    fontSize: 11,
    fontFamily: "InterBold",
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 0.3,
  },
  cardContent: {
    flex: 1,
  },
  cardDescription: {
    fontSize: 12,
    color: "#5E5D6A",
    fontFamily: "Inter",
    marginTop: 4,
    lineHeight: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 24,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(46, 125, 50, 0.06)",
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: "InterSemiBold",
    color: "#2E7D32",
    marginLeft: 6,
  },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 32,
    padding: 24,
    shadowColor: "#71717A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontFamily: "InterMedium",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 18,
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#5E5D6A",
    textAlign: "center",
    fontFamily: "Inter",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  codeCard: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    borderWidth: 1.5,
    borderColor: "#2E7D32",
    borderStyle: "dashed",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  codeLabel: {
    fontSize: 11,
    fontFamily: "InterBold",
    color: "#5E5D6A",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 36,
    fontFamily: "ManropeBold",
    fontWeight: "bold",
    color: "#2E7D32",
    letterSpacing: 2,
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  copyButtonText: {
    fontSize: 13,
    fontFamily: "InterBold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  blob1: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(195, 226, 196, 0.22)",
  },
  blob2: {
    position: "absolute",
    bottom: 80,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(168, 209, 170, 0.12)",
  },
});
