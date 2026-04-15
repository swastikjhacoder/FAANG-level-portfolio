"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [status, setStatus] = useState(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token ? "" : "Invalid verification link",
  );

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);

        const data = await res.json();

        setStatus(data.success ? "success" : "error");
        setMessage(data.message);
      } catch {
        setStatus("error");
        setMessage("Something went wrong");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <h2 className="text-xl font-semibold">Verifying...</h2>
            <p className="text-gray-500 mt-2">Please wait</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-2xl font-bold text-green-600">
              ✅ Email Verified
            </h2>
            <p className="text-gray-600 mt-2">{message}</p>

            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold text-red-600">
              ❌ Verification Failed
            </h2>
            <p className="text-gray-600 mt-2">{message}</p>

            <button
              onClick={() => router.push("/login")}
              className="mt-6 w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
