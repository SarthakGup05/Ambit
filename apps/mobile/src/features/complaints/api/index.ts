import { api } from '@/lib/axios';
import { ComplaintItem, ComplaintStatus, CreateComplaintInput } from '../types';

/**
 * Fetch complaints list from backend API
 */
export async function fetchComplaints(status?: string): Promise<ComplaintItem[]> {
  const params: Record<string, string> = {};
  if (status && status !== 'all') {
    params.status = status;
  }
  const response = await api.get('/api/complaints', { params });
  return response.data?.complaints || [];
}

/**
 * Create a new complaint ticket
 */
export async function createComplaintApi(input: CreateComplaintInput): Promise<ComplaintItem> {
  const response = await api.post('/api/complaints', input);
  return response.data?.complaint;
}

/**
 * Update complaint ticket status
 */
export async function updateComplaintStatusApi(
  id: string,
  status: ComplaintStatus
): Promise<ComplaintItem> {
  const response = await api.patch(`/api/complaints/${id}/status`, { status });
  return response.data?.complaint;
}

/**
 * Add a comment or response to a complaint ticket
 */
export async function addComplaintCommentApi(
  id: string,
  text: string
): Promise<ComplaintItem> {
  const response = await api.post(`/api/complaints/${id}/comments`, { text });
  return response.data?.complaint;
}
