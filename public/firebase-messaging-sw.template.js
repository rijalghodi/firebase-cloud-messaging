importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Firebase configuration - will be replaced by build process
firebase.initializeApp({
  apiKey: "{{FIREBASE_API_KEY}}",
  authDomain: "{{FIREBASE_AUTH_DOMAIN}}",
  projectId: "{{FIREBASE_PROJECT_ID}}",
  storageBucket: "{{FIREBASE_STORAGE_BUCKET}}",
  messagingSenderId: "{{FIREBASE_MESSAGING_SENDER_ID}}",
  appId: "{{FIREBASE_APP_ID}}",
  measurementId: "{{FIREBASE_MEASUREMENT_ID}}",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data,
    actions: [
      {
        action: "open",
        title: "Open",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
    tag: payload.data?.tag || "default", // Prevents duplicate notifications
    requireInteraction: false,
    silent: false,
  };

  return self.registration.showNotification(payload.notification.title, notificationOptions);
});

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  if (event.action === "open" || !event.action) {
    const data = event.notification.data;

    event.waitUntil(
      (async () => {
        const allClients = await clients.matchAll();
        const focusedClient = allClients.find((client) => client.focused);

        const targetUrl = new URL(data.url, self.location.origin).href;

        if (focusedClient) {
          focusedClient.navigate(targetUrl);
        } else {
          await clients.openWindow(targetUrl);
        }
      })()
    );
  }
});

// Handle notification close
self.addEventListener("notificationclose", function (event) {
  console.log("Notification closed:", event);
});
