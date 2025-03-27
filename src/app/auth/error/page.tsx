"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You need to grant the necessary permissions to use DyzBox.",
    Verification: "The verification link is no longer valid.",
    Default: "An error occurred during authentication."
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">DyzBox</h1>
          <p className="mt-2 text-gray-600">Authentication Error</p>
        </div>

        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {errorMessage}
        </div>

        <div className="text-center">
          <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800">
            Try signing in again
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">DyzBox</h1>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
} 