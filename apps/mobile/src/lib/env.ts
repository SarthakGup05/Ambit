import Constants from 'expo-constants';

const getLocalDevUrl = (port: number) => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return `http://localhost:${port}`;
  const ip = hostUri.split(":")[0];
  return `http://${ip}:${port}`;
};

export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? getLocalDevUrl(3001) : 'http://localhost:3001'),
  socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL || (__DEV__ ? getLocalDevUrl(3001) : 'http://localhost:3001'),
  isDevelopment: process.env.NODE_ENV === 'development',
};
