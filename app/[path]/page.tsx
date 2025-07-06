"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function RandomPage() {
  const params = useParams();
  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl mx-auto px-4 py-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 space-y-8">🤗 Hola!</h1>
        <p>You opened this page:</p>
        <code className="text-lg">{params.path}</code>
        <p className="mt-8">
          <Link href="/" className="text-blue-500 hover:underline">
            ← Go to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
