import { create } from 'zustand';

export interface NotificationCategoryCounts {
  approvals: number;
  notices: number;
  alerts: number;
  system: number;
}

interface NotificationState {
  unreadCount: number;
  categoryCounts: NotificationCategoryCounts;

  // Actions
  setUnreadCount: (count: number) => void;
  setCategoryCount: (category: keyof NotificationCategoryCounts, count: number) => void;
  incrementUnread: (amount?: number) => void;
  decrementUnread: (amount?: number) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 3,
  categoryCounts: {
    approvals: 2,
    notices: 1,
    alerts: 0,
    system: 0,
  },

  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),

  setCategoryCount: (category, count) =>
    set((state) => {
      const updated = {
        ...state.categoryCounts,
        [category]: Math.max(0, count),
      };
      const total = Object.values(updated).reduce((acc, curr) => acc + curr, 0);
      return {
        categoryCounts: updated,
        unreadCount: total,
      };
    }),

  incrementUnread: (amount = 1) =>
    set((state) => ({ unreadCount: state.unreadCount + amount })),

  decrementUnread: (amount = 1) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - amount) })),

  markAllAsRead: () =>
    set({
      unreadCount: 0,
      categoryCounts: {
        approvals: 0,
        notices: 0,
        alerts: 0,
        system: 0,
      },
    }),
}));
