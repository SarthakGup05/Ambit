export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'resolved';
}
