import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Firebase Cloud Messaging Demo",
  description: "A demo of Firebase Cloud Messaging",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // useRegisterServiceWorker();

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <FCMListener /> */}
        {children}
      </body>
    </html>
  );
}
