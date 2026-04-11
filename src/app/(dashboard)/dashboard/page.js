"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardPage() {
  const router = useRouter();
  const { isLoggedIn, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;

    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [hydrated, isLoggedIn, router]);

  if (!hydrated) return null;
  if (!isLoggedIn) return null;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Welcome to your protected dashboard 🚀</p>
    </div>
  );
}
