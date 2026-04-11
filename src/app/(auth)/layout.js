"use client";

import { useAuthStore } from "@/store/useAuthStore";

export default function AuthLayout({ children }) {
  const hydrated = useAuthStore((s) => s.hydrated);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">
            Login or create an account to continue
          </p>
        </div>

        {children}
      </div>

      <div className="absolute inset-0 -z-10 blur-3xl opacity-20">
        <div className="w-[500px] h-[500px] bg-blue-500 rounded-full absolute top-10 left-10"></div>
        <div className="w-[400px] h-[400px] bg-purple-500 rounded-full absolute bottom-10 right-10"></div>
      </div>
    </div>
  );
}
