import React, { useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Clipboard,
  Alert,
} from "react-native";
import { Text } from "@repo/ui";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/auth.store";
import { api } from "../../src/lib/axios";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  MapPin,
  User,
  LayoutGrid,
  CheckCircle2,
  ClipboardCopy,
  Layers3,
  Home,
  BadgeCheck,
} from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1
  societyName: string;
  address: string;
  city: string;
  // Step 2
  adminFlatNumber: string;
  adminTitle: string;
  // Step 3
  towersCount: string;
  totalFlats: string;
  // Step 4 is review
}

const TOTAL_STEPS = 4;

const STEP_META = [
  {
    label: "Society Details",
    sublabel: "Your society's identity",
    icon: Building2,
    color: "#6366F1",
    lightColor: "#EEF2FF",
  },
  {
    label: "Admin Profile",
    sublabel: "Your role in the society",
    icon: User,
    color: "#0EA5E9",
    lightColor: "#F0F9FF",
  },
  {
    label: "Infrastructure",
    sublabel: "Size & layout",
    icon: Layers3,
    color: "#10B981",
    lightColor: "#ECFDF5",
  },
  {
    label: "Review & Launch",
    sublabel: "Confirm and go live",
    icon: BadgeCheck,
    color: "#F59E0B",
    lightColor: "#FFFBEB",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  icon: Icon,
  iconColor,
  autoCapitalize = "words",
  keyboardType = "default",
  multiline = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: any;
  iconColor: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: any;
  multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.inputRow, focused && fieldStyles.inputRowFocused]}>
        <View style={[fieldStyles.iconBox, { backgroundColor: iconColor + "18" }]}>
          <Icon size={18} color={iconColor} strokeWidth={2} />
        </View>
        <TextInput
          style={[fieldStyles.input, multiline && { height: 72, textAlignVertical: "top" }]}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontFamily: "InterBold",
    color: "#334155",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  inputRowFocused: {
    borderColor: "#6366F1",
    backgroundColor: "#FFFFFF",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: 52,
    fontFamily: "InterMedium",
    fontSize: 15,
    color: "#0F172A",
    paddingRight: 16,
    paddingVertical: 0,
  },
});

function ReviewRow({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <View style={reviewRowStyles.row}>
      <View style={[reviewRowStyles.iconBox, { backgroundColor: color + "18" }]}>
        <Icon size={16} color={color} strokeWidth={2} />
      </View>
      <View style={reviewRowStyles.content}>
        <Text style={reviewRowStyles.label}>{label}</Text>
        <Text style={reviewRowStyles.value}>{value || "—"}</Text>
      </View>
    </View>
  );
}

const reviewRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  content: { flex: 1 },
  label: {
    fontSize: 11,
    fontFamily: "InterBold",
    color: "#94A3B8",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: { fontSize: 15, fontFamily: "InterMedium", color: "#0F172A" },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function AdminSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, user, setAuth } = useAuthStore();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");

  const [form, setForm] = useState<FormData>({
    societyName: "",
    address: "",
    city: "",
    adminFlatNumber: "",
    adminTitle: "",
    towersCount: "",
    totalFlats: "",
  });

  const update = useCallback((key: keyof FormData) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setError(null);
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!form.societyName.trim()) return "Society name is required";
      if (!form.address.trim()) return "Address is required";
      if (!form.city.trim()) return "City is required";
    }
    if (step === 2) {
      if (!form.adminFlatNumber.trim()) return "Your flat/unit number is required";
      if (!form.adminTitle.trim()) return "Your title is required";
    }
    if (step === 3) {
      if (!form.towersCount.trim() || isNaN(Number(form.towersCount)))
        return "Please enter a valid number of towers";
      if (!form.totalFlats.trim() || isNaN(Number(form.totalFlats)))
        return "Please enter a valid number of flats";
    }
    return null;
  };

  const goNext = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (step < TOTAL_STEPS) {
      setDirection("forward");
      setStep((s) => s + 1);
      setError(null);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setDirection("back");
      setStep((s) => s - 1);
      setError(null);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/onboarding/admin", {
        name: form.societyName.trim(),
        address: `${form.address.trim()}, ${form.city.trim()}`,
        adminFlatNumber: form.adminFlatNumber.trim(),
        towersCount: Number(form.towersCount) || 0,
        totalFlats: Number(form.totalFlats) || 0,
      });
      const { society, user: updatedUser } = response.data;
      setInviteCode(society.inviteCode);
      setAuth(token, updatedUser);
      setStep(5); // Success step
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to create society. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    Clipboard.setString(inviteCode);
    Alert.alert("Copied!", "Invite code copied to clipboard.");
  };

  // ── Animated progress ────────────────────────────────────────────────────────

  const progressWidth = `${((Math.min(step, TOTAL_STEPS) - 1) / (TOTAL_STEPS - 1)) * 100}%` as any;

  // ── Step content ─────────────────────────────────────────────────────────────

  const enterAnim = direction === "forward" ? SlideInRight.duration(320) : SlideInLeft.duration(320);
  const exitAnim = direction === "forward" ? SlideOutLeft.duration(320) : SlideOutRight.duration(320);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#F0F4FF", "#F8FAFC", "#FFFFFF"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step <= TOTAL_STEPS && (
            <>
              {/* ── Top Bar ─────────────────────────────────────────────────── */}
              <Animated.View entering={FadeIn.duration(300)} style={styles.topBar}>
                <Pressable onPress={goBack} style={styles.backBtn} hitSlop={12}>
                  <ArrowLeft size={20} color="#0F172A" strokeWidth={2.2} />
                </Pressable>
                <Text style={styles.topBarTitle}>Society Setup</Text>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{step} / {TOTAL_STEPS}</Text>
                </View>
              </Animated.View>

              {/* ── Progress Bar ──────────────────────────────────────────────── */}
              <Animated.View entering={FadeIn.duration(400).delay(80)} style={styles.progressSection}>
                <View style={styles.progressTrack}>
                  <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                </View>
                <View style={styles.stepDots}>
                  {STEP_META.map((s, i) => {
                    const stepNum = i + 1;
                    const isDone = stepNum < step;
                    const isActive = stepNum === step;
                    const StepIcon = s.icon;
                    return (
                      <View key={stepNum} style={styles.dotWrapper}>
                        <View
                          style={[
                            styles.dot,
                            isDone && styles.dotDone,
                            isActive && { backgroundColor: s.color, borderColor: s.color },
                          ]}
                        >
                          {isDone ? (
                            <CheckCircle2 size={14} color="#FFFFFF" strokeWidth={2.5} />
                          ) : (
                            <StepIcon size={14} color={isActive ? "#FFFFFF" : "#CBD5E1"} strokeWidth={2} />
                          )}
                        </View>
                        <Text style={[styles.dotLabel, isActive && { color: s.color, fontFamily: "InterBold" }]}>
                          {s.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>

              {/* ── Step Header ──────────────────────────────────────────────── */}
              <Animated.View key={`header-${step}`} entering={FadeIn.duration(300).delay(100)} style={styles.stepHeader}>
                <View style={[styles.stepIconBox, { backgroundColor: STEP_META[step - 1].lightColor }]}>
                  {React.createElement(STEP_META[step - 1].icon, {
                    size: 28,
                    color: STEP_META[step - 1].color,
                    strokeWidth: 1.8,
                  })}
                </View>
                <Text style={styles.stepTitle}>{STEP_META[step - 1].label}</Text>
                <Text style={styles.stepSubtitle}>{STEP_META[step - 1].sublabel}</Text>
              </Animated.View>
            </>
          )}

          {/* ── Error Banner ─────────────────────────────────────────────────── */}
          {error && (
            <Animated.View entering={FadeIn.duration(250)} style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          {/* ── Step 1: Society Details ────────────────────────────────────── */}
          {step === 1 && (
            <Animated.View key="step1" entering={enterAnim} exiting={exitAnim} style={styles.formCard}>
              <FormField label="Society / Apartment Name" placeholder="e.g. Green Meadows Residency" value={form.societyName} onChangeText={update("societyName")} icon={Building2} iconColor="#6366F1" />
              <FormField label="Street Address" placeholder="e.g. 24th Main Road, Sector 5" value={form.address} onChangeText={update("address")} icon={MapPin} iconColor="#6366F1" multiline />
              <FormField label="City" placeholder="e.g. Bangalore" value={form.city} onChangeText={update("city")} icon={MapPin} iconColor="#6366F1" />
            </Animated.View>
          )}

          {/* ── Step 2: Admin Profile ─────────────────────────────────────── */}
          {step === 2 && (
            <Animated.View key="step2" entering={enterAnim} exiting={exitAnim} style={styles.formCard}>
              <FormField label="Your Flat / Apartment Number" placeholder="e.g. A-101 or Tower B - 405" value={form.adminFlatNumber} onChangeText={update("adminFlatNumber")} icon={Home} iconColor="#0EA5E9" autoCapitalize="characters" />
              <FormField label="Your Role / Title" placeholder="e.g. President, Secretary, Owner" value={form.adminTitle} onChangeText={update("adminTitle")} icon={User} iconColor="#0EA5E9" />
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  💡 Your title will be visible to residents and guards in the society directory.
                </Text>
              </View>
            </Animated.View>
          )}

          {/* ── Step 3: Infrastructure ───────────────────────────────────── */}
          {step === 3 && (
            <Animated.View key="step3" entering={enterAnim} exiting={exitAnim} style={styles.formCard}>
              <FormField label="Number of Towers / Blocks" placeholder="e.g. 3" value={form.towersCount} onChangeText={update("towersCount")} icon={Layers3} iconColor="#10B981" keyboardType="number-pad" autoCapitalize="none" />
              <FormField label="Approximate Total Flats / Units" placeholder="e.g. 120" value={form.totalFlats} onChangeText={update("totalFlats")} icon={LayoutGrid} iconColor="#10B981" keyboardType="number-pad" autoCapitalize="none" />
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  🏗️ We'll automatically generate tower structure for you. You can edit this later from the admin dashboard.
                </Text>
              </View>
            </Animated.View>
          )}

          {/* ── Step 4: Review ────────────────────────────────────────────── */}
          {step === 4 && (
            <Animated.View key="step4" entering={enterAnim} exiting={exitAnim} style={styles.formCard}>
              <View style={styles.reviewHeader}>
                <CheckCircle2 size={20} color="#10B981" strokeWidth={2} />
                <Text style={styles.reviewHeaderText}>Everything looks good?</Text>
              </View>
              <ReviewRow label="Society Name" value={form.societyName} icon={Building2} color="#6366F1" />
              <ReviewRow label="Address" value={`${form.address}, ${form.city}`} icon={MapPin} color="#6366F1" />
              <ReviewRow label="Admin Unit" value={form.adminFlatNumber} icon={Home} color="#0EA5E9" />
              <ReviewRow label="Your Title" value={form.adminTitle} icon={User} color="#0EA5E9" />
              <ReviewRow label="No. of Towers" value={form.towersCount} icon={Layers3} color="#10B981" />
              <ReviewRow label="Total Flats" value={form.totalFlats} icon={LayoutGrid} color="#10B981" />
            </Animated.View>
          )}

          {/* ── Step 5: Success ───────────────────────────────────────────── */}
          {step === 5 && (
            <Animated.View key="step5" entering={FadeIn.duration(500)} style={styles.successContainer}>
              <View style={styles.successIconRing}>
                <CheckCircle2 size={52} color="#10B981" strokeWidth={1.6} />
              </View>
              <Text style={styles.successTitle}>Society Created! 🎉</Text>
              <Text style={styles.successSubtitle}>
                Your society is live. Share the invite code below with residents and guards to onboard them instantly.
              </Text>
              <View style={styles.codeCard}>
                <LinearGradient colors={["#ECFDF5", "#D1FAE5"]} style={StyleSheet.absoluteFillObject} />
                <Text style={styles.codeLabel}>YOUR INVITE CODE</Text>
                <Text style={styles.codeText}>{inviteCode}</Text>
                <Pressable style={styles.copyBtn} onPress={handleCopy}>
                  <ClipboardCopy size={16} color="#FFFFFF" />
                  <Text style={styles.copyBtnText}>Copy Code</Text>
                </Pressable>
              </View>
              <Pressable style={styles.dashboardBtn} onPress={() => router.replace("/")}>
                <LinearGradient colors={["#0F172A", "#1E293B"]} style={StyleSheet.absoluteFillObject} />
                <Text style={styles.dashboardBtnText}>Go to Admin Dashboard</Text>
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.2} />
              </Pressable>
            </Animated.View>
          )}

          {/* ── Navigation Buttons ───────────────────────────────────────── */}
          {step <= TOTAL_STEPS && (
            <View style={styles.navRow}>
              {step === TOTAL_STEPS ? (
                <Pressable
                  style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  <LinearGradient colors={["#10B981", "#059669"]} style={StyleSheet.absoluteFillObject} />
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>Launch Society</Text>
                      <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: 8 }} />
                    </>
                  )}
                </Pressable>
              ) : (
                <Pressable style={styles.primaryBtn} onPress={goNext}>
                  <LinearGradient
                    colors={[STEP_META[step - 1].color, STEP_META[step - 1].color + "CC"]}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Text style={styles.primaryBtnText}>Continue</Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: 8 }} />
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  blob1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(99, 102, 241, 0.06)",
  },
  blob2: {
    position: "absolute",
    bottom: 100,
    left: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "ManropeBold",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  stepBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 12,
    fontFamily: "InterBold",
    color: "#64748B",
  },

  // Progress
  progressSection: { marginBottom: 32 },
  progressTrack: {
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 4,
  },
  stepDots: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dotWrapper: { alignItems: "center", flex: 1 },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  dotDone: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  dotLabel: {
    fontSize: 9,
    fontFamily: "InterMedium",
    color: "#94A3B8",
    textAlign: "center",
    letterSpacing: 0.2,
  },

  // Step header
  stepHeader: { alignItems: "center", marginBottom: 24 },
  stepIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 22,
    fontFamily: "ManropeBold",
    color: "#0F172A",
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    fontFamily: "InterMedium",
    color: "#64748B",
  },

  // Form card
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
  },

  // Info box
  infoBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    marginTop: 4,
  },
  infoText: { fontSize: 13, fontFamily: "InterMedium", color: "#0369A1", lineHeight: 20 },

  // Review
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  reviewHeaderText: {
    fontSize: 16,
    fontFamily: "ManropeBold",
    color: "#0F172A",
  },

  // Error
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, fontFamily: "InterMedium", color: "#DC2626", textAlign: "center" },

  // Navigation
  navRow: { marginTop: 4 },
  primaryBtn: {
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "ManropeBold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  // Success
  successContainer: { alignItems: "center", paddingVertical: 20 },
  successIconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#A7F3D0",
  },
  successTitle: {
    fontSize: 28,
    fontFamily: "ManropeBold",
    color: "#0F172A",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 15,
    fontFamily: "InterMedium",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  codeCard: {
    width: "100%",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#6EE7B7",
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 11,
    fontFamily: "InterBold",
    color: "#059669",
    letterSpacing: 2,
    marginBottom: 10,
  },
  codeText: {
    fontSize: 40,
    fontFamily: "ManropeBold",
    color: "#065F46",
    letterSpacing: 6,
    marginBottom: 20,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  copyBtnText: { fontSize: 14, fontFamily: "InterBold", color: "#FFFFFF" },
  dashboardBtn: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    gap: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  dashboardBtnText: { fontSize: 16, fontFamily: "ManropeBold", color: "#FFFFFF", letterSpacing: 0.3 },
});
