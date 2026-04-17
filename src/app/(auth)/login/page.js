"use client";

import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <LoginForm />

      <p className="text-sm text-gray-400 text-center">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
