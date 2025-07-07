"use client";

import { requestFCMToken, requestNotificationPermission, useForegroundNotifications } from "@/services/firebase/fcm";
import firebaseApp from "@/services/firebase/firebase";
import { deleteToken, getMessaging } from "firebase/messaging";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Types
interface NotificationInput {
  title: string;
  body: string;
  token: string;
  useCustomToken: boolean;
  url: string;
}

interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  textArea?: boolean;
  error?: string | null;
}

interface CopyButtonProps {
  value: string;
}

// Main Component
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
  const [requiredTokenError, setRequiredTokenError] = useState<string | null>(null);

  // Initialize foreground notifications
  useForegroundNotifications();

  // Handlers
  const handleSendNotification = async () => {
    if (notifInput.useCustomToken && !notifInput.token) {
      setRequiredTokenError("Please provide a token");
      return;
    }

    setRequiredTokenError(null);
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
    } finally {
      setSending(false);
    }
  };

  const handleSetupFCM = async () => {
    try {
      setLoadingSubscribe(true);
      const permission = await requestNotificationPermission();

      if (permission) {
        const token = await requestFCMToken();
        if (token) {
          setFcmToken(token);
        }
      }
    } catch (error) {
      toast.error("Failed to subscribe notification", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoadingSubscribe(false);
    }
  };

  const handleUnsubscribeFCM = async () => {
    try {
      setLoadingSubscribe(true);
      const messaging = getMessaging(firebaseApp);
      await deleteToken(messaging);
      setFcmToken(null);
    } catch (error) {
      console.error("Error unsubscribing from FCM:", error);
    } finally {
      setLoadingSubscribe(false);
    }
  };

  const handleUpdateNotifInput = (field: keyof NotificationInput, value: string | boolean) => {
    setNotifInput((prev) => ({ ...prev, [field]: value }));
  };

  const handleTokenChange = (value: string) => {
    setRequiredTokenError(null);
    handleUpdateNotifInput("token", value);
  };

  // Effects
  useEffect(() => {
    handleSetupFCM();

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

        <FCMTokenSection
          fcmToken={fcmToken}
          loadingSubscribe={loadingSubscribe}
          onSubscribe={handleSetupFCM}
          onUnsubscribe={handleUnsubscribeFCM}
        />

        <NotificationForm
          notifInput={notifInput}
          requiredTokenError={requiredTokenError}
          sending={sending}
          onUpdateInput={handleUpdateNotifInput}
          onTokenChange={handleTokenChange}
          onSubmit={handleSendNotification}
        />

        <Footer />
      </div>
    </div>
  );
}

// FCM Token Management Component
function FCMTokenSection({
  fcmToken,
  loadingSubscribe,
  onSubscribe,
  onUnsubscribe,
}: {
  fcmToken: string | null;
  loadingSubscribe: boolean;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
}) {
  return (
    <div className="w-full">
      {fcmToken ? (
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-center">Your Firebase Token (Auto-generated)</p>
            <div className="flex items-end gap-2">
              <Input value={fcmToken} onChange={() => {}} readOnly />
              <CopyButton value={fcmToken} />
            </div>
          </div>

          <div className="flex justify-center w-full">
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={onUnsubscribe}
              disabled={loadingSubscribe}
            >
              {loadingSubscribe ? "Unsubscribing..." : "Unsubscribe Notifications"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center w-full">
          <button
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={onSubscribe}
            disabled={loadingSubscribe}
          >
            {loadingSubscribe ? "Subscribing..." : "Subscribe to Notifications"}
          </button>
        </div>
      )}
    </div>
  );
}

// Notification Form Component
function NotificationForm({
  notifInput,
  requiredTokenError,
  sending,
  onUpdateInput,
  onTokenChange,
  onSubmit,
}: {
  notifInput: NotificationInput;
  requiredTokenError: string | null;
  sending: boolean;
  onUpdateInput: (field: keyof NotificationInput, value: string | boolean) => void;
  onTokenChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="space-y-4 flex flex-col items-start w-full p-6 border border-gray-200 shadow-lg rounded-xl"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <h3 className="text-xl font-bold mb-4">Send Notification</h3>

      <Input
        label="Title"
        value={notifInput.title}
        onChange={(value) => onUpdateInput("title", value)}
        placeholder="Enter notification title"
      />

      <Input
        label="Body"
        value={notifInput.body}
        onChange={(value) => onUpdateInput("body", value)}
        placeholder="Enter notification message"
        textArea
      />

      <Input
        label="URL (Optional)"
        value={notifInput.url}
        onChange={(value) => onUpdateInput("url", value)}
        placeholder="https://example.com"
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="useCustomToken"
          checked={notifInput.useCustomToken}
          onChange={(e) => onUpdateInput("useCustomToken", e.target.checked)}
        />
        <label htmlFor="useCustomToken">Use Cross-Device Firebase Token</label>
      </div>

      {notifInput.useCustomToken && (
        <Input
          label="Firebase Token"
          value={notifInput.token}
          onChange={onTokenChange}
          placeholder="Paste Firebase token from another device"
          error={requiredTokenError}
        />
      )}

      <button
        className="bg-gray-800 hover:bg-gray-700 text-white mt-4 px-4 py-2 rounded-lg transition-colors"
        type="submit"
        disabled={sending}
      >
        {sending ? "Sending..." : "Send Notification"}
      </button>
    </form>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="text-sm text-gray-500 mt-10">
      Made by{" "}
      <a
        href="https://github.com/rijalghodi"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline text-gray-800"
      >
        Rijal Ghodi
      </a>
      <span className="text-gray-500 mx-2">|</span>
      <a
        href="https://github.com/rijalghodi/firebase-cloud-messaging"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline text-gray-800"
      >
        Github Repo
      </a>
    </footer>
  );
}

// Reusable Input Component
function Input({ label, value, onChange, placeholder, readOnly, textArea, error }: InputProps) {
  const inputClasses = [
    "p-1.5 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-gray-800 transition-colors",
    error ? "border-red-500 focus:ring-red-500" : "",
  ].join(" ");

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
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

// Copy Button Component
function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      toast.error("Failed to copy", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <button
      className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-20 px-4 py-2 rounded-lg transition-colors"
      onClick={handleCopy}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
