import { api } from '@/lib/axios';

export interface GuestPass {
  id: string;
  guestName: string;
  token: string;
  validTo: string;
  isUsed: boolean;
}

export interface VerifyPassResult {
  valid: boolean;
  message?: string;
  pass?: GuestPass;
  residentName?: string;
  flatNumber?: string;
  error?: string;
}

export class GuestPassService {
  /**
   * 🎫 Retrieve all guest passes created by the resident
   */
  static async getResidentGuestPasses(): Promise<GuestPass[]> {
    const response = await api.get('/api/guest-passes');
    return response.data?.guestPasses || [];
  }

  /**
   * ✍️ Generate a new pre-approved guest gate pass
   */
  static async createGuestPass(guestName: string, validTo: string): Promise<GuestPass> {
    const response = await api.post('/api/guest-passes', { guestName, validTo });
    return response.data?.guestPass;
  }

  /**
   * 🎟️ Verify guest pass token / 6-digit code at the gate (Guard action)
   */
  static async verifyGuestPass(token: string): Promise<VerifyPassResult> {
    try {
      const response = await api.post('/api/guest-passes/verify', { token });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return { valid: false, error: 'Network error verifying pass' };
    }
  }
}
