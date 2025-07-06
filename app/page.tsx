"use client";

import { requestFCMToken, requestNotificationPermission, useForegroundNotifications } from "@/services/firebase/fcm";
import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [targetToken, setTargetToken] = useState<string>("");
  // Initialize foreground notifications
  useForegroundNotifications();

  const sendForegroundTest = async (type: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: targetToken || fcmToken || localStorage.getItem("fcmToken") || "",
          type: type,
        }),
      });

      if (response.ok) {
        console.log(`Sent ${type} notification`);
      } else {
        console.error("Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
    setLoading(false);
  };

  const setupFCM = async () => {
    try {
      // Request notification permission
      const permission = await requestNotificationPermission();
      setPermissionGranted(permission);

      if (permission) {
        // Get FCM token
        const token = await requestFCMToken();
        if (token) {
          setFcmToken(token);
          localStorage.setItem("fcmToken", token);
          console.log("FCM Token:", token);
        }
      }
    } catch (error) {
      console.error("Error setting up FCM:", error);
    }
  };

  useEffect(() => {
    setupFCM();

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("SW registered:", registration);
        })
        .catch(console.error);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-gray-800">Firebase Cloud Messaging Demo</h1>

        {/* Notification Permission */}
        <div className="space-y-2">
          {permissionGranted ? (
            <p className="text-green-700">✅ Notification permission granted</p>
          ) : (
            <div className="space-y-2">
              <p className="text-red-600">❌ Notification permission not granted</p>
              <button className="bg-green-600 text-white rounded-full px-3 py-1 text-sm" onClick={setupFCM}>
                Grant Permission
              </button>
            </div>
          )}
          {fcmToken && (
            <div className="space-y-2">
              <span className="text-green-700">✅ FCM Token received </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(fcmToken);
                  alert(`token copied: \n\n${fcmToken}`);
                }}
                className="bg-gray-300 text-sm text-gray-700 rounded-full px-3 py-0.5 cursor-pointer"
              >
                Copy Token
              </button>
            </div>
          )}
        </div>

        {/* Target Token */}
        <div className="space-y-2 flex flex-col items-start">
          <h3 className="text-lg font-semibold text-gray-700">Target FCM Token:</h3>
          <p className="text-sm text-gray-500">
            A FCM token is a unique identifier for a device where the notification will be sent. If this is empty, then
            notification will be sent to this device.
          </p>
          <textarea
            value={targetToken}
            onChange={(e) => setTargetToken(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-full"
            placeholder="Enter FCM Token"
            rows={4}
          />
        </div>

        {/* Test Notifications */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Test Notifications:</h3>
          <p className="text-sm text-gray-500">Try to send notification to the target device.</p>
          <div className="space-y-4 space-x-2 items-center mt-5">
            <button
              className="bg-green-600 text-white rounded-full px-4 py-2"
              onClick={() => sendForegroundTest("basic")}
              disabled={loading}
            >
              Basic Notification
            </button>
            <button
              className="bg-purple-500 text-white rounded-full px-4 py-2"
              onClick={() => sendForegroundTest("action")}
              disabled={loading}
            >
              Action Notification
            </button>
            <button
              className="bg-orange-500 text-white rounded-full px-4 py-2"
              onClick={() => sendForegroundTest("navigate")}
              disabled={loading}
            >
              Navigate Notification
            </button>
            <button
              className="bg-red-500 text-white rounded-full px-4 py-2"
              onClick={() => sendForegroundTest("refresh")}
              disabled={loading}
            >
              Refresh Notification
            </button>
            <button
              className="bg-indigo-500 text-white rounded-full px-4 py-2"
              onClick={() => sendForegroundTest("custom")}
              disabled={loading}
            >
              Custom Data Notification
            </button>
          </div>
          {loading && <p>Sending Notification...</p>}
        </div>

        <footer className="text-sm text-gray-500 mt-10">
          Made by{" "}
          <a href="https://github.com/rijalghodi" className="text-blue-500" target="_blank">
            Rijal Ghodi
          </a>
          <span className="text-gray-500 mx-2">|</span>
          <a href="https://github.com/rijalghodi/firebase-cloud-messaging" className="text-blue-500" target="_blank">
            Github Repo
          </a>
        </footer>
      </div>
    </div>
  );
}
