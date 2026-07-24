import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { NotificationService } from '../NotificationService';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register device for push notifications, retrieve Expo push token, and sync with backend
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0d3a2a',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Push Notification] Permission not granted for push notifications');
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    if (!projectId) {
      console.warn('[Push Notification] EAS Project ID not found in Expo constants');
    }

    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      )
    ).data;

    console.log('[Push Notification] Expo Push Token obtained:', pushTokenString);

    // Sync token with backend server
    if (pushTokenString) {
      try {
        await NotificationService.registerPushToken(pushTokenString);
        console.log('[Push Notification] Token registered with server successfully');
      } catch (err) {
        console.error('[Push Notification] Failed to register token with server:', err);
      }
    }

    return pushTokenString;
  } catch (error) {
    console.error('[Push Notification] Error during push notification registration:', error);
    return null;
  }
}

/**
 * Setup notification event listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) {
  const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[Push Notification] Notification received in foreground:', notification);
    onNotificationReceived?.(notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[Push Notification] Notification tapped by user:', response);
    onNotificationResponse?.(response);
  });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}
