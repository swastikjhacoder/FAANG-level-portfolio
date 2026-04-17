"use client";

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Reset Password
        </h2>

        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
