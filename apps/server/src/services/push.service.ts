import { db } from "../db/index.js";
import { user } from "../models/schema.js";
import { eq } from "drizzle-orm";

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  try {
    const foundUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!foundUser || !foundUser.pushToken) {
      console.log(`[Push Notification] No push token found for user ${userId}`);
      return;
    }

    await sendExpoPush(foundUser.pushToken, title, body, data);
  } catch (error) {
    console.error("[Push Notification] Failed to send notification:", error);
  }
}

export async function sendExpoPush(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  try {
    // Basic verification of expo push token format
    if (!expoPushToken.startsWith("ExponentPushToken[")) {
      console.warn(`[Push Notification] Invalid Expo push token format: ${expoPushToken}`);
      return;
    }

    const payload = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data,
    };

    console.log(`[Push Notification] Sending to Expo: ${expoPushToken}`);

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Expo response status: ${response.status}`);
    }

    const resJson = await response.json();
    console.log("[Push Notification] Expo response:", JSON.stringify(resJson));
  } catch (error) {
    console.error("[Push Notification] Error invoking Expo API:", error);
  }
}
