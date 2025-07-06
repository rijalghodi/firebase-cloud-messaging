import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
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
        <Toaster
          position="bottom-center"
          richColors
          duration={20000}
          closeButton
          toastOptions={{
            classNames: {
              toast: "border border-gray-300 rounded-lg text-sm",
              actionButton: "!text-md",
            },
            style: {
              fontSize: "14px",
              border: "1px solid #e0e0e0",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
