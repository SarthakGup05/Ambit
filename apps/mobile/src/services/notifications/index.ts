import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from '@/lib/axios';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notifications = {
  /**
   * 📲 Request permissions and register device push token with the backend
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return null;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log('[Push Token] Acquired Expo Push Token:', token);

      // Register the token with the backend server
      await api.post('/api/notifications/register-token', { token });
      console.log('[Push Token] Successfully registered with backend');

      return token;
    } catch (error) {
      console.error('[Push Token] Error during registration:', error);
      return null;
    }
  },

  /**
   * 🔔 Listen to incoming notifications and interactions
   */
  setupListeners() {
    if (Platform.OS === 'web') {
      return () => {};
    }

    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Received foreground notification:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('User interacted with notification:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  },
};
