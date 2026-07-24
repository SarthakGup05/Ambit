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

export interface ExpoPushMessage {
  to: string;
  sound?: string;
  title?: string;
  body?: string;
  data?: Record<string, any>;
}

export async function sendBatchExpoPush(messages: ExpoPushMessage[]) {
  try {
    // Filter valid push tokens
    const validMessages = messages.filter((msg) =>
      msg.to.startsWith("ExponentPushToken[")
    );

    if (validMessages.length === 0) return;

    // Expo Push API recommends chunks of up to 100 messages
    const CHUNK_SIZE = 100;
    const chunks = [];
    for (let i = 0; i < validMessages.length; i += CHUNK_SIZE) {
      chunks.push(validMessages.slice(i, i + CHUNK_SIZE));
    }

    console.log(`[Push Notification] Sending ${validMessages.length} push notifications in ${chunks.length} batch(es)`);

    for (const chunk of chunks) {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        console.error(`[Push Notification] Batch Expo response status: ${response.status}`);
      } else {
        const resJson = await response.json();
        console.log("[Push Notification] Batch Expo response received");
      }
    }
  } catch (error) {
    console.error("[Push Notification] Error invoking Batch Expo API:", error);
  }
}
