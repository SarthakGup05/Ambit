import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../src/store/auth.store";
import { AnimatedSplash } from "../src/features/auth/components/AnimatedSplash";
import { storage } from "../src/lib/storage";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);
  const { token, user } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);

    // Check if user has already seen the welcome carousel
    async function checkWelcomeStatus() {
      const seen = await storage.get("has_seen_welcome");
      setHasSeenWelcome(seen === "true");
    }
    checkWelcomeStatus();
  }, []);

  if (!isMounted || hasSeenWelcome === null) {
    return null;
  }

  if (showSplash) {
    return <AnimatedSplash onFinish={() => setShowSplash(false)} />;
  }

  // 1. Unauthenticated -> Go to login screen
  if (!token || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // 2. Authenticated but hasn't seen welcome carousel -> Show welcome
  if (!hasSeenWelcome) {
    return <Redirect href="/welcome" />;
  }

  // 3. Authenticated but no society selected -> Go to onboarding flow
  if (!user.societyId) {
    return <Redirect href="/(onboarding)" />;
  }

  // 4. Authenticated and has society -> Route to specific dashboard
  if (user.role === "admin") {
    return <Redirect href="/(admin)/(tabs)" />;
  } else if (user.role === "guard") {
    return <Redirect href="/(guard)/(tabs)" />;
  } else {
    return <Redirect href="/(resident)/(tabs)" />;
  }
}
