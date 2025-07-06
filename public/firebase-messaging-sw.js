// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Firebase configuration - these will be replaced by build process
// or you can use a different approach to inject environment variables
firebase.initializeApp({
  apiKey: "AIzaSyCmltrMTVBDWqjw2KFHILIaAzyYEHk2Uj0",
  authDomain: "todoin-da3fe.firebaseapp.com",
  projectId: "todoin-da3fe",
  storageBucket: "todoin-da3fe.firebasestorage.app",
  messagingSenderId: "839854434662",
  appId: "1:839854434662:web:3b4a4e632c354d22e1c0a7",
  measurementId: "G-565R96N4Z7",
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

        switch (data.action) {
          case "open_url":
            if (data.url) {
              if (focusedClient) {
                focusedClient.postMessage({ type: "open_url", url: data.url });
              } else {
                await clients.openWindow(data.url);
              }
            }
            break;
          case "navigate":
            if (data.route) {
              const targetUrl = new URL(data.route, self.location.origin).href;
              if (focusedClient) {
                focusedClient.navigate(targetUrl);
              } else {
                await clients.openWindow(targetUrl);
              }
            }
            break;
          case "refresh":
            if (focusedClient) {
              focusedClient.reload();
            } else {
              await clients.openWindow(self.location.origin);
            }
            break;
          default:
            await clients.openWindow(new URL("/", self.location.origin).href);
        }
      })()
    );
  }
});

// Handle notification close
self.addEventListener("notificationclose", function (event) {
  console.log("Notification closed:", event);
});
