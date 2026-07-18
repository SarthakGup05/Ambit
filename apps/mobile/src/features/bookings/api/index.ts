import { api } from '@/lib/axios';

export interface Amenity {
  id: string;
  name: string;
  description: string;
  capacity: number;
}

export interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  amenityId: string;
  amenityName: string;
}

export interface CreateBookingInput {
  amenityId: string;
  startTime: string;
  endTime: string;
}

/**
 * Fetch all available society amenities
 */
export async function fetchAmenitiesApi(): Promise<Amenity[]> {
  const response = await api.get('/api/bookings/amenities');
  return response.data?.amenities || [];
}

/**
 * Fetch bookings list
 */
export async function fetchBookingsApi(): Promise<Booking[]> {
  const response = await api.get('/api/bookings');
  return response.data?.bookings || [];
}

/**
 * Create a new booking
 */
export async function createBookingApi(input: CreateBookingInput): Promise<Booking> {
  const response = await api.post('/api/bookings', input);
  return response.data?.booking;
}
