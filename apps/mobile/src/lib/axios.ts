import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';
import Constants from 'expo-constants';

const getLocalDevUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return "http://localhost:3001";
  const ip = hostUri.split(":")[0];
  return `http://${ip}:3001`;
};

export const api = axios.create({
  // Use port 3001 as default since our backend runs on 3001
  baseURL: process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? getLocalDevUrl() : 'http://localhost:3001'),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach authentication session tokens
api.interceptors.request.use(
  (config) => {
    // Attach Authorization Bearer token header for token-based auth
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

