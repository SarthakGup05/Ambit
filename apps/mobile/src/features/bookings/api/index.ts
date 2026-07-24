import { api } from '@/lib/axios';
import { Waves, Dumbbell, Trophy, Coffee, Sparkles } from 'lucide-react-native';

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

export function getAmenityIconConfig(name: string) {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('pool') || lowercaseName.includes('swim'))
    return { Icon: Waves, color: '#0284C7', bgColor: 'rgba(2, 132, 199, 0.12)' };
  if (lowercaseName.includes('gym') || lowercaseName.includes('fitness'))
    return { Icon: Dumbbell, color: '#7C3AED', bgColor: 'rgba(124, 58, 237, 0.12)' };
  if (lowercaseName.includes('tennis') || lowercaseName.includes('court'))
    return { Icon: Trophy, color: '#DD6B20', bgColor: 'rgba(221, 107, 32, 0.12)' };
  if (lowercaseName.includes('club') || lowercaseName.includes('lounge'))
    return { Icon: Coffee, color: '#DB2777', bgColor: 'rgba(219, 39, 119, 0.12)' };
  return { Icon: Sparkles, color: '#0D9488', bgColor: 'rgba(13, 148, 136, 0.12)' };
}

