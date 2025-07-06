"use client";

import { requestFCMToken, requestNotificationPermission, useForegroundNotifications } from "@/services/firebase/fcm";
import { messaging } from "@/services/firebase/firebase";
import { deleteToken } from "firebase/messaging";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NotificationInput {
  title: string;
  body: string;
  token: string;
  useCustomToken: boolean;
  url: string;
}

export default function Home() {
  const [sending, setSending] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [loadingSubscribe, setLoadingSubscribe] = useState(false);
  const [notifInput, setNotifInput] = useState<NotificationInput>({
    title: "",
    body: "",
    token: "",
    useCustomToken: false,
    url: "",
  });

  // Initialize foreground notifications
  useForegroundNotifications();

  const sendNotification = async () => {
    setSending(true);
    try {
      const token = notifInput.useCustomToken ? notifInput.token : fcmToken || "";
      const response = await fetch("/api/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          title: notifInput.title,
          body: notifInput.body,
          url: notifInput.url,
        }),
      });

      if (response.ok) {
        toast.success("Notification sent");
      }
    } catch (error) {
      toast.error("Failed to send notification", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
    setSending(false);
  };

  const setupFCM = async () => {
    try {
      setLoadingSubscribe(true);
      const permission = await requestNotificationPermission();

      if (permission) {
        const token = await requestFCMToken();
        if (token) {
          setFcmToken(token);
          console.log("FCM Token:", token);
        }
      }
    } catch (error) {
      console.error("Error setting up FCM:", error);
    } finally {
      setLoadingSubscribe(false);
    }
  };

  const unsubscribeFCM = async () => {
    try {
      setLoadingSubscribe(true);
      await deleteToken(messaging);
      setFcmToken(null);
    } catch (error) {
      console.error("Error unsubscribing from FCM:", error);
    } finally {
      setLoadingSubscribe(false);
    }
  };

  const updateNotifInput = (field: keyof NotificationInput, value: string | boolean) => {
    setNotifInput((prev) => ({ ...prev, [field]: value }));
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
    <div className="min-h-screen text-gray-800">
      <div className="container max-w-3xl mx-auto px-4 py-8 flex flex-col items-center gap-10">
        <h1 className="text-2xl font-bold text-gray-800 text-center">🔥 Firebase Cloud Messaging Demo</h1>

        {/* FCM Token Management */}
        <div className="w-full">
          {fcmToken ? (
            <div className="w-full flex flex-col gap-6">
              <div className="flex justify-center w-full">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={unsubscribeFCM}
                  disabled={loadingSubscribe}
                >
                  {loadingSubscribe ? "Unsubscribing..." : "Unsubscribe Notifications"}
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-center">Your Firebase Token (Auto-generated)</p>
                <div className="flex items-end gap-2">
                  <Input value={fcmToken} onChange={() => {}} readOnly />
                  <CopyButton value={fcmToken} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <button
                className="bg-gray-800 hover:bg-gray-700 text-white"
                onClick={setupFCM}
                disabled={loadingSubscribe}
              >
                {loadingSubscribe ? "Subscribing..." : "Subscribe to Notifications"}
              </button>
            </div>
          )}
        </div>

        {/* Notification Form */}
        <form
          className="space-y-4 flex flex-col items-start w-full p-6 border border-gray-200 shadow-lg rounded-xl"
          onSubmit={(e) => {
            e.preventDefault();
            sendNotification();
          }}
        >
          <h3 className="text-xl font-bold mb-4">Send Notification</h3>

          <Input
            label="Title"
            value={notifInput.title}
            onChange={(value) => updateNotifInput("title", value)}
            placeholder="Enter notification title"
          />

          <Input
            label="Body"
            value={notifInput.body}
            onChange={(value) => updateNotifInput("body", value)}
            placeholder="Enter notification message"
            textArea
          />

          <Input
            label="URL (Optional)"
            value={notifInput.url}
            onChange={(value) => updateNotifInput("url", value)}
            placeholder="https://example.com"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useCustomToken"
              checked={notifInput.useCustomToken}
              onChange={(e) => updateNotifInput("useCustomToken", e.target.checked)}
            />
            <label htmlFor="useCustomToken">Use Cross-Device Firebase Token</label>
          </div>

          {notifInput.useCustomToken && (
            <Input
              label="Firebase Token"
              value={notifInput.token}
              onChange={(value) => updateNotifInput("token", value)}
              placeholder="Paste Firebase token from another device"
            />
          )}

          <button className="bg-gray-800 hover:bg-gray-700 text-white mt-4" type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </form>

        <footer className="text-sm text-gray-500 mt-10">
          Made by{" "}
          <a href="https://github.com/rijalghodi" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Rijal Ghodi
          </a>
          <span className="text-gray-500 mx-2">|</span>
          <a
            href="https://github.com/rijalghodi/firebase-cloud-messaging"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Github Repo
          </a>
        </footer>
      </div>
    </div>
  );
}

// Reusable Input Component
function Input({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
  textArea,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  textArea?: boolean;
}) {
  const inputClasses =
    "p-1.5 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-gray-700";

  return (
    <div className="w-full space-y-1.5">
      {label && <label className="font-medium block">{label}</label>}
      {textArea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          placeholder={placeholder}
          readOnly={readOnly}
          rows={2}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}

// Copy Button Component
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-20" onClick={handleCopy}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
