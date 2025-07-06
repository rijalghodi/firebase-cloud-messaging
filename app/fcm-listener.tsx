// components/FCMListener.tsx
"use client";

import { listenToMessages, requestFCMToken } from "@/services/firebase/fcm";
import { useEffect } from "react";

export default function FCMListener() {
  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await requestFCMToken();
      localStorage.setItem("fcmToken", token || "");
      console.log("FCM Token:", token);
    }
    listenToMessages((payload) => {
      console.log("Foreground Message:", payload);
      // Show custom toast/notification
      alert(JSON.stringify(payload));
    });
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return <button onClick={requestPermission}>Enable Notifications</button>;
}
