import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { useAuthStore, type UserSession } from "../../../store/auth.store";
import { authClient } from "../../../lib/auth-client";
import { storage } from "../../../lib/storage";

export function useAuth() {
  const router = useRouter();
  const { token, user, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to sign in");
      }

      const data = response.data;
      if (!data) {
        throw new Error("No data returned from sign in");
      }

      const sessionToken = data.token || (data as any).session?.token || "";
      if (!sessionToken) {
        throw new Error("No session token received from the server. Check backend expo() plugin.");
      }
      const userSession: UserSession = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: (data.user as any).role || "resident",
        societyId: (data.user as any).societyId || null,
        flatNumber: (data.user as any).flatNumber || null,
      };

      // Persist in secure local storage for offline-first instant boot
      await storage.set("auth_token", sessionToken);
      await storage.set("auth_user", JSON.stringify(userSession));

      // Update global state
      setAuth(sessionToken, userSession);
      return userSession;
    } catch (err: any) {
      const errMsg = err.message || "Failed to sign in";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [setAuth]);

  const register = useCallback(async (
    name: string, 
    email: string, 
    password: string, 
    role: "admin" | "resident" | "guard",
    inviteCode?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authClient.signUp.email({
        email,
        password,
        name,
        role,
        ...(inviteCode ? { inviteCode: inviteCode.trim().toUpperCase() } : {}),
      } as any);

      if (response.error) {
        throw new Error(response.error.message || "Failed to sign up");
      }

      const data = response.data;
      if (!data) {
        throw new Error("No data returned from sign up");
      }

      const sessionToken = data.token || (data as any).session?.token || "";
      if (!sessionToken) {
        throw new Error("No session token received from the server. Check backend expo() plugin.");
      }
      const userSession: UserSession = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: (data.user as any).role || "resident",
        societyId: (data.user as any).societyId || null,
        flatNumber: (data.user as any).flatNumber || null,
      };

      // Persist in secure local storage
      await storage.set("auth_token", sessionToken);
      await storage.set("auth_user", JSON.stringify(userSession));

      // Update global state
      setAuth(sessionToken, userSession);
      return userSession;
    } catch (err: any) {
      const errMsg = err.message || "Failed to sign up";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [setAuth]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
    } catch (err) {
      console.warn("Sign out request failed", err);
    } finally {
      // Clear persistence and state
      await storage.remove("auth_token");
      await storage.remove("auth_user");
      clearAuth();
      setIsLoading(false);
      // Navigate cleanly back to login screen
      router.replace("/(auth)/login");
    }
  }, [clearAuth, router]);

  const initializeAuth = useCallback(async () => {
    try {
      // 1. Instant local restore (Offline-first approach)
      const cachedToken = await storage.get("auth_token");
      const cachedUserJson = await storage.get("auth_user");
      
      if (cachedToken && cachedUserJson) {
        const userSession = JSON.parse(cachedUserJson) as UserSession;
        setAuth(cachedToken, userSession);
      }

      // 2. Background verification & validation with server
      try {
        const response = await authClient.getSession();
        if (response.data) {
          const session = response.data;
          const userSession: UserSession = {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: (session.user as any).role || "resident",
            societyId: (session.user as any).societyId || null,
            flatNumber: (session.user as any).flatNumber || null,
          };
          const validToken = cachedToken || "";
          
          // Update persistence and state with fresh server data
          await storage.set("auth_token", validToken);
          await storage.set("auth_user", JSON.stringify(userSession));
          setAuth(validToken, userSession);
        } else if (response.error) {
          // If server explicitly responds with auth error, session is invalid/expired
          await storage.remove("auth_token");
          await storage.remove("auth_user");
          clearAuth();
        }
      } catch (netErr: any) {
        // If it's a network reachability issue, gracefully let the user stay logged in offline
        console.warn("Offline or backend unreachable, keeping local session active:", netErr.message || netErr);
      }
    } catch (err) {
      console.error("Failed to restore authenticated session:", err);
    }
  }, [setAuth, clearAuth]);

  return {
    token,
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    initializeAuth,
  };
}
