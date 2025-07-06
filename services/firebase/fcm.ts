"use client";

import firebaseApp from "@/services/firebase/firebase";
import {
  getMessaging,
  getToken,
  MessagePayload,
  onMessage,
} from "firebase/messaging";
import { useEffect } from "react";

export async function requestFCMToken(): Promise<string | null> {
  try {
    const messaging = getMessaging(firebaseApp);
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
    });
    return token || null;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
}

// Simple foreground notification handler using alert()
export function useForegroundNotifications() {
  useEffect(() => {
    const messaging = getMessaging(firebaseApp);

    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
      console.log("Foreground message received:", payload);

      const title = payload.notification?.title || "New Message";
      const body = payload.notification?.body || "";
      const data = payload.data;

      // Show simple alert with notification details
      let alertMessage = `${title}\n\n${body}`;

      // Add data information if available
      if (data && Object.keys(data).length > 0) {
        alertMessage += `\n\nData: ${JSON.stringify(data, null, 2)}`;
      }

      // Show the alert
      alert(alertMessage);

      // Handle custom actions if present
      if (data?.action) {
        handleNotificationAction(data.action, data);
      }
    });

    return () => unsubscribe();
  }, []);
}

// Handle notification actions
function handleNotificationAction(action: string, data: Record<string, any>) {
  switch (action) {
    case "open_url":
      if (data.url) {
        window.open(data.url, "_blank");
      }
      break;
    case "navigate":
      if (data.route) {
        window.location.href = data.route;
      }
      break;
    case "refresh":
      window.location.reload();
      break;
    default:
      console.log("Unknown notification action:", action);
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    console.log("Notification permission denied");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

// Legacy function for backward compatibility
export function listenToMessages(callback: (payload: any) => void) {
  const messaging = getMessaging(firebaseApp);
  return onMessage(messaging, callback);
}

export function useRegisterServiceWorker() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("SW registered:", registration);
        })
        .catch(console.error);
    }
  }, []);
}
