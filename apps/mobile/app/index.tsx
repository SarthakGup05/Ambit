import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../src/store/auth.store";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const { token, user } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // 1. Unauthenticated -> Go to login screen
  if (!token || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // 2. Authenticated but no society selected -> Go to onboarding flow
  if (!user.societyId) {
    return <Redirect href="/(onboarding)" />;
  }

  // 3. Authenticated and has society -> Route to specific dashboard
  if (user.role === "admin") {
    return <Redirect href="/(admin)" />; // Admin dashboard
  } else if (user.role === "guard") {
    return <Redirect href="/(guard)" />; // Guard dashboard
  } else {
    return <Redirect href="/(resident)" />; // Resident dashboard
  }
}
