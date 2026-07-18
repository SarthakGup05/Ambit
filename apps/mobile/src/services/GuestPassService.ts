import { api } from '@/lib/axios';

export interface GuestPass {
  id: string;
  guestName: string;
  token: string;
  validTo: string;
  isUsed: boolean;
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
}
