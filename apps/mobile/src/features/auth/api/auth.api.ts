import { api } from "../../../lib/axios";

export const authApi = {
  /**
   * Logs in a user using email and password.
   */
  async signIn(email: string, password: string) {
    const response = await api.post("/api/auth/sign-in/email", {
      email: email.trim().toLowerCase(),
      password,
    });
    return response.data;
  },

  /**
   * Registers a new user account.
   */
  async signUp(name: string, email: string, password: string) {
    const response = await api.post("/api/auth/sign-up/email", {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    return response.data;
  },

  /**
   * Logs out the user from the session.
   */
  async signOut() {
    await api.post("/api/auth/sign-out");
  }
};
