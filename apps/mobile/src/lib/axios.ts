import axios from 'axios';
import { authClient } from './auth-client';

export const api = axios.create({
  // Use port 3001 as default since our backend runs on 3001
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach authentication session cookies
api.interceptors.request.use(
  async (config) => {
    const cookies = authClient.getCookie();
    if (cookies) {
      config.headers.cookie = cookies;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
