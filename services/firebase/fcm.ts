"use client";

import firebaseApp from "@/services/firebase/firebase";
import { getMessaging, getToken, MessagePayload, onMessage } from "firebase/messaging";
import { useEffect } from "react";
import { toast } from "sonner";

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
      const title = payload.notification?.title || "";
      const body = payload.notification?.body || "";
      const data = payload.data;
      // Show the alert
      toast(title, {
        description: body,
        action: {
          label: "Open",
          onClick: () => {
            window.location.href = data?.url || "/";
          },
        },
      });
    });
    return () => unsubscribe();
  }, []);
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
