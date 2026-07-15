export interface PendingVisitor {
  id: string;
  name: string;
  type: string;
  flat: string;
  requestedAt: string;
}

export interface RecentVisitor {
  id: string;
  name: string;
  date: string;
  status: 'approved' | 'denied' | 'completed' | string;
}

export interface LatestNotice {
  title: string;
  description: string;
}
