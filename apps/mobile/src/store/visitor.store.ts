import { create } from 'zustand';
import { VisitorService, Visitor, VisitorStats } from '@/services/VisitorService';

interface VisitorState {
  visitors: Visitor[];
  stats: VisitorStats;
  loading: boolean;
  error: string | null;

  // Actions
  fetchVisitors: (filter?: string) => Promise<void>;
  addVisitor: (visitor: Visitor) => void;
  checkoutVisitorLocal: (id: string, checkOutTime?: string) => void;
  checkoutVisitor: (id: string) => Promise<Visitor | null>;
  registerVisitor: (data: {
    flatNumber: string;
    name: string;
    phone?: string;
    purpose: string;
    autoCheckIn?: boolean;
  }) => Promise<Visitor>;
  setStats: (stats: VisitorStats) => void;
}

export const useVisitorStore = create<VisitorState>((set, get) => ({
  visitors: [],
  stats: { total: 0, entered: 0, exited: 0, pending: 0 },
  loading: false,
  error: null,

  fetchVisitors: async (filter = 'all') => {
    set({ loading: true, error: null });
    try {
      const data = await VisitorService.getSocietyVisitors(filter);
      set({
        visitors: data.visitors,
        stats: data.stats,
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || 'Failed to load visitors',
      });
    }
  },

  setStats: (stats) => set({ stats }),

  addVisitor: (newVisitor) => {
    set((state) => {
      const exists = state.visitors.some((v) => v.id === newVisitor.id);
      const updatedVisitors = exists
        ? state.visitors.map((v) => (v.id === newVisitor.id ? newVisitor : v))
        : [newVisitor, ...state.visitors];

      const isCheckedIn = newVisitor.status === 'checked_in' || newVisitor.status === 'approved';
      const isPending = newVisitor.status === 'pending';

      return {
        visitors: updatedVisitors,
        stats: {
          ...state.stats,
          total: state.stats.total + (exists ? 0 : 1),
          entered: state.stats.entered + (isCheckedIn && !exists ? 1 : 0),
          pending: state.stats.pending + (isPending && !exists ? 1 : 0),
        },
      };
    });
  },

  checkoutVisitorLocal: (id, checkOutTime) => {
    const time = checkOutTime || new Date().toISOString();
    set((state) => {
      let wasCheckedIn = false;
      const updatedVisitors = state.visitors.map((v) => {
        if (v.id === id) {
          if (v.status === 'checked_in' || v.status === 'approved') {
            wasCheckedIn = true;
          }
          return { ...v, status: 'checked_out' as const, checkOutTime: time };
        }
        return v;
      });

      return {
        visitors: updatedVisitors,
        stats: {
          ...state.stats,
          entered: Math.max(0, state.stats.entered - (wasCheckedIn ? 1 : 0)),
          exited: state.stats.exited + (wasCheckedIn ? 1 : 0),
        },
      };
    });
  },

  checkoutVisitor: async (id) => {
    try {
      const updated = await VisitorService.checkoutVisitor(id);
      get().checkoutVisitorLocal(id, updated?.checkOutTime);
      return updated;
    } catch (err) {
      throw err;
    }
  },

  registerVisitor: async (data) => {
    const newVisitor = await VisitorService.registerVisitor(data);
    if (newVisitor) {
      get().addVisitor(newVisitor);
    }
    return newVisitor;
  },
}));
