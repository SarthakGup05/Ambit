import { api } from '@/lib/axios';

export interface Visitor {
  id: string;
  flatNumber?: string;
  name: string;
  phone: string;
  purpose: string;
  status: 'pending' | 'approved' | 'denied' | 'checked_in' | 'checked_out';
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: string;
}

export interface VisitorStats {
  total: number;
  entered: number;
  exited: number;
  pending: number;
}

export interface ResidentDirectoryMember {
  id: string;
  name: string;
  email: string;
  flatNumber: string;
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
   * 🛡️ Fetch society-wide visitors & stats (Guard view)
   */
  static async getSocietyVisitors(status: string = 'all'): Promise<{ visitors: Visitor[]; stats: VisitorStats }> {
    const response = await api.get('/api/visitors', { params: { status } });
    return {
      visitors: response.data?.visitors || [],
      stats: response.data?.stats || { total: 0, entered: 0, exited: 0, pending: 0 },
    };
  }

  /**
   * 🚪 Register visitor at gate (Guard action)
   */
  static async registerVisitor(data: {
    flatNumber: string;
    name: string;
    phone?: string;
    purpose: string;
    autoCheckIn?: boolean;
  }): Promise<Visitor> {
    const response = await api.post('/api/visitors', data);
    return response.data?.visitor;
  }

  /**
   * 🚪 Check out a visitor leaving the premises (Guard action)
   */
  static async checkoutVisitor(id: string): Promise<Visitor> {
    const response = await api.patch(`/api/visitors/${id}/checkout`);
    return response.data?.visitor;
  }

  /**
   * 🏢 Fetch resident directory (flats & names)
   */
  static async getResidentDirectory(): Promise<ResidentDirectoryMember[]> {
    const response = await api.get('/api/visitors/directory');
    return response.data?.directory || [];
  }

  /**
   * 🔄 Update visitor request check-in status (Approve / Deny)
   */
  static async updateVisitorStatus(id: string, status: 'approved' | 'denied' | 'checked_in' | 'checked_out'): Promise<Visitor> {
    const response = await api.patch(`/api/visitors/${id}/status`, { status });
    return response.data?.visitor;
  }
}
