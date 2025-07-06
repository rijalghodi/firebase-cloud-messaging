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
    const { token, title, body, url } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "FCM token is required" }, { status: 400 });
    }

    let message: any = {
      token,
      notification: {
        title: title || "Test Notification",
        body: body || "This is a test notification",
      },
      data: {
        timestamp: Date.now().toString(),
        url,
      },
    };

    const response = await getMessaging().send(message);

    return NextResponse.json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
