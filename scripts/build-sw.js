const fs = require("fs");
const path = require("path");

// Read environment variables
require("dotenv").config({ path: ".env.local" });

// Environment variable mapping
const envMapping = {
  "{{FIREBASE_API_KEY}}": process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  "{{FIREBASE_AUTH_DOMAIN}}": process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  "{{FIREBASE_PROJECT_ID}}": process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  "{{FIREBASE_STORAGE_BUCKET}}": process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  "{{FIREBASE_MESSAGING_SENDER_ID}}": process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  "{{FIREBASE_APP_ID}}": process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  "{{FIREBASE_MEASUREMENT_ID}}": process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required environment variables
const missingVars = Object.entries(envMapping)
  .filter(([placeholder, value]) => !value)
  .map(([placeholder]) => placeholder);

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingVars.forEach((placeholder) => {
    const envVar = placeholder.replace(/[{}]/g, "").replace("FIREBASE_", "NEXT_PUBLIC_FIREBASE_");
    console.error(`   - ${envVar}`);
  });
  process.exit(1);
}

// Read the template file
const templatePath = path.join(__dirname, "../public/firebase-messaging-sw.template.js");
const targetPath = path.join(__dirname, "../public/firebase-messaging-sw.js");

if (!fs.existsSync(templatePath)) {
  console.error("❌ Template file not found: public/firebase-messaging-sw.template.js");
  process.exit(1);
}

let templateContent = fs.readFileSync(templatePath, "utf8");

console.log("🔍 Template content length:", templateContent.length);
console.log("🔍 Looking for placeholders...");

// Replace all placeholders with environment variables
Object.entries(envMapping).forEach(([placeholder, value]) => {
  const beforeCount = (templateContent.match(new RegExp(placeholder, "g")) || []).length;
  templateContent = templateContent.replace(new RegExp(placeholder, "g"), value);
  const afterCount = (templateContent.match(new RegExp(placeholder, "g")) || []).length;
  console.log(`🔧 Replaced ${beforeCount} instances of ${placeholder} with ${value?.substring(0, 10)}...`);
});

// Write the processed service worker file
fs.writeFileSync(targetPath, templateContent, "utf8");

console.log("✅ Service worker built successfully");
console.log("📁 Template: public/firebase-messaging-sw.template.js");
console.log("📁 Output: public/firebase-messaging-sw.js");
console.log("🔧 Environment variables injected from .env.local");

// Log the Firebase config (without sensitive data)
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + "...",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.substring(0, 20) + "...",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log("📋 Firebase config preview:", JSON.stringify(config, null, 2));
