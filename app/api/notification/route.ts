import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { NextRequest, NextResponse } from "next/server";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { token, type = "basic" } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "FCM token is required" }, { status: 400 });
    }

    let message: any = {
      token,
      notification: {
        title: "Test Notification",
        body: "This is a test notification",
      },
      data: {
        timestamp: Date.now().toString(),
        type: type,
      },
    };

    // Different notification types for testing
    switch (type) {
      case "action":
        message.notification.title = "Action Required";
        message.notification.body = "Click to perform an action";
        message.data.action = "open_url";
        message.data.url = "https://example.com";
        break;

      case "navigate":
        message.notification.title = "Navigation Test";
        message.notification.body = "Click to navigate to a specific page";
        message.data.action = "navigate";
        message.data.route = "/random";
        break;

      case "refresh":
        message.notification.title = "Refresh Test";
        message.notification.body = "Click to refresh the page";
        message.data.action = "refresh";
        break;

      case "custom":
        message.notification.title = "Custom Data Test";
        message.notification.body = "This notification has custom data";
        message.data.customField = "customValue";
        message.data.userId = "12345";
        break;

      default:
        message.notification.title = "Basic Test";
        message.notification.body = "This is a basic notification";
    }

    const response = await getMessaging().send(message);

    return NextResponse.json({
      success: true,
      messageId: response,
      type: type,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
