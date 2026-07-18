import { api } from '@/lib/axios';

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  status: 'pending' | 'approved' | 'denied' | 'checked_in' | 'checked_out';
  createdAt: string;
}

export class VisitorService {
  /**
   * 📋 Fetch all visitor requests for the resident's flat
   */
  static async getFlatVisitors(): Promise<Visitor[]> {
    const response = await api.get('/api/visitors/flat');
    return response.data?.visitors || [];
  }

  /**
   * 🔄 Update visitor request check-in status (Approve / Deny)
   */
  static async updateVisitorStatus(id: string, status: 'approved' | 'denied'): Promise<Visitor> {
    const response = await api.patch(`/api/visitors/${id}/status`, { status });
    return response.data?.visitor;
  }
}
