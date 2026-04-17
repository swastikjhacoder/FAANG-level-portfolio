"use client";

import Sidebar from "@/components/dashboard/layout/Sidebar";
import Header from "@/components/dashboard/layout/Header";
import DashboardThemeProvider from "@/components/dashboard/layout/DashboardThemeProvider";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { Suspense } from "react";
import Loader from "@/components/shared/Loader";

export default function DashboardLayout({ children }) {
  return (
    <DashboardThemeProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <aside className="w-64 hidden md:block border-r border-gray-200 dark:border-gray-800">
          <Sidebar />
        </aside>

        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-50  border-b border-gray-200 dark:border-gray-800  bg-white/70 dark:bg-gray-900/70  backdrop-blur">
            <Header />
          </header>

          <main className="flex-1 p-6">
            <ErrorBoundary>
              <Suspense fallback={<Loader fullScreen />}>{children}</Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </DashboardThemeProvider>
  );
}
