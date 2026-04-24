"use client";

import Loader from "@/components/shared/Loader";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }) {
  const router = useRouter();
  const { hydrated, user } = useAuthStore();

  useEffect(() => {
    if (hydrated && user) {
      router.replace("/dashboard");
    }
  }, [hydrated, user, router]);

  if (!hydrated) return <Loader fullScreen />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-900">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Login or create an account to continue
          </p>
        </div>

        <ErrorBoundary>{children}</ErrorBoundary>
      </div>

      <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
        <div className="w-125 h-125 bg-blue-300 rounded-full absolute top-10 left-10"></div>
        <div className="w-100 h-100 bg-purple-300 rounded-full absolute bottom-10 right-10"></div>
      </div>
    </div>
  );
}
