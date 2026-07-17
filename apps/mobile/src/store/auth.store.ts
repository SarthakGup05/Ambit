import { create } from 'zustand';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'resident' | 'guard';
  societyId: string | null;
  flatNumber: string | null;
}

interface AuthState {
  token: string | null;
  user: UserSession | null;
  setAuth: (token: string | null, user: UserSession | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  clearAuth: () => set({ token: null, user: null }),
}));
