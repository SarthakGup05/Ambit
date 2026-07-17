import { useState, useCallback } from "react";
import { useAuthStore, type UserSession } from "../../../store/auth.store";
import { authClient } from "../../../lib/auth-client";

export function useAuth() {
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
      const userSession: UserSession = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: (data.user as any).role || "resident",
        societyId: (data.user as any).societyId || null,
        flatNumber: (data.user as any).flatNumber || null,
      };

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

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to sign up");
      }

      const data = response.data;
      if (!data) {
        throw new Error("No data returned from sign up");
      }

      const sessionToken = data.token || (data as any).session?.token || "";
      const userSession: UserSession = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: (data.user as any).role || "resident",
        societyId: (data.user as any).societyId || null,
        flatNumber: (data.user as any).flatNumber || null,
      };

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
      clearAuth();
      setIsLoading(false);
    }
  }, [clearAuth]);

  const initializeAuth = useCallback(async () => {
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
        const cookies = authClient.getCookie() || "";
        setAuth(cookies, userSession);
      }
    } catch (err) {
      console.error("Failed to restore authenticated session:", err);
    }
  }, [setAuth]);

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
