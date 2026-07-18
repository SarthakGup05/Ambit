import { api } from '@/lib/axios';
import { Booking } from '@/features/bookings/api';

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
}

export class OverviewService {
  /**
   * 📋 Fetch all society notices
   */
  static async getNotices(): Promise<Notice[]> {
    const response = await api.get('/api/notices');
    return response.data?.notices || [];
  }

  /**
   * 📅 Fetch all active amenity bookings
   */
  static async getBookings(): Promise<Booking[]> {
    const response = await api.get('/api/bookings');
    return response.data?.bookings || [];
  }
}
