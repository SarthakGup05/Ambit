export type ComplaintCategory =
  | 'plumbing'
  | 'electrical'
  | 'elevator'
  | 'maintenance'
  | 'security'
  | 'other';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface ComplaintComment {
  id: string;
  author: string;
  role: 'resident' | 'admin' | 'staff';
  text: string;
  createdAt: string;
}

export interface ComplaintItem {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  residentName: string;
  flatNumber: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string | null;
  comments?: ComplaintComment[];
}

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  flatNumber: string;
}
