# 🔥 Firebase Cloud Messaging Demo

A simple, working demo of Firebase Cloud Messaging (FCM) with Next.js. Send push notifications between devices and see how they work in real-time!

## ✨ What This Demo Shows

- **Foreground notifications** - When the app is open (shows as alerts)
- **Background notifications** - When the app is closed (shows as system notifications)
- **Cross-device messaging** - Send notifications between different devices/browsers
- **Custom actions** - Navigate, open URLs, refresh, and more

## 🚀 Live Demo

Check out the live demo: [https://firebase-cloud-messaging-demo.vercel.app/](https://firebase-cloud-messaging-demo.vercel.app/)

## 🎯 How to Test

### 1. **Grant Permission**

Click "Grant Permission" when prompted to allow notifications.

### 2. **Test Different Notification Types**

- **Basic** - Simple message notification
- **Action** - Opens a URL in new tab
- **Navigate** - Takes you to a specific page
- **Refresh** - Reloads the current page
- **Custom Data** - Shows extra information

### 3. **Cross-Device Testing**

1. Open the app on two devices (phone + laptop, or two browsers)
2. Grant permission on both devices
3. Copy the FCM token from one device
4. Paste it in the "Target Token" field on the other device
5. Send notifications between devices!

## 🛠️ Local Setup

### Prerequisites

- Node.js 18+
- Firebase project

### 1. **Firebase Setup**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Add a web app
4. Go to Project Settings → Service Accounts
5. Generate a new private key (download JSON file)

### 2. **Environment Variables**

Create `.env.local` file:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin (from downloaded JSON)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# VAPID Key (from Cloud Messaging tab)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### 3. **Install & Run**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 📄 License

MIT License - feel free to use this in your own projects!

---

**Made with ❤️ and Firebase**
