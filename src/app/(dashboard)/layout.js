"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import Header from "@/components/dashboard/layout/Header";
import DashboardThemeProvider from "@/components/dashboard/layout/DashboardThemeProvider";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { Suspense } from "react";
import Loader from "@/components/shared/Loader";
import AuthGuard from "@/components/dashboard/auth/AuthGuard";
import Footer from "@/components/dashboard/layout/Footer";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <DashboardThemeProvider>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          <aside
            className={`${
              collapsed ? "w-20" : "w-64"
            } hidden sm:block transition-all duration-300 border-r`}
          >
            <Sidebar collapsed={collapsed} setMobileOpen={setMobileOpen} />
          </aside>

          {mobileOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setMobileOpen(false)}
              />

              <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 z-50 shadow-lg">
                <Sidebar collapsed={false} setMobileOpen={setMobileOpen} />
              </aside>
            </>
          )}

          <div className="flex flex-col flex-1">
            <Header
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              setMobileOpen={setMobileOpen}
            />

            <main className="flex-1 p-4 sm:p-6">
              <ErrorBoundary>
                <Suspense fallback={<Loader fullScreen />}>{children}</Suspense>
              </ErrorBoundary>
            </main>

            <Footer />
          </div>
        </div>
      </DashboardThemeProvider>
    </AuthGuard>
  );
}
