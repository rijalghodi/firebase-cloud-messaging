import Link from "next/link";

type Props = {};

export default function RandomPage({}: Props) {
  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl mx-auto px-4 py-8 text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-5 space-y-8">Random Page</h1>
        <p>A random page to test the notification navigation.</p>
        <p>
          <Link href="/" className="text-blue-500">
            Go to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
