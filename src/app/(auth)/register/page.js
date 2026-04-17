"use client";

import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <>
      <RegisterForm />

      <p className="text-sm text-gray-400 text-center mt-4">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Login
        </Link>
      </p>
    </>
  );
}
