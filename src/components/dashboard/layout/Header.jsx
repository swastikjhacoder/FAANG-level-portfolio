"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardThemeStore } from "@/store/useDashboardThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Sun, Moon, Bell, User, LogOut, Key, UserCircle } from "lucide-react";
import Image from "next/image";
import ProfileModal from "@/components/dashboard/profile/ProfileModal";
import AutoCloseModal from "../ui/AutoCloseModal";
import GlobalLoader from "@/components/shared/GlobalLoader";

export default function Header() {
  const router = useRouter();
  const dropdownRef = useRef(null);
  const [modal, setModal] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const {
    theme,
    toggleTheme,
    hydrated: themeHydrated,
  } = useDashboardThemeStore();

  const { user, logout, hydrated: authHydrated, setHydrated } = useAuthStore();

  useEffect(() => {
    setHydrated();
  }, [setHydrated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!themeHydrated || !authHydrated) return null;

  const firstName =
    user?.name?.firstName || user?.name?.displayName?.split(" ")[0] || "User";

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    router.push("/login");
  };

  const handleOpenProfile = () => {
    setIsOpen(false);
    setShowProfileModal(true);
  };

  const handleForgotPassword = async () => {
    if (loadingReset) return;

    setIsOpen(false);
    setLoadingReset(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user?.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setLoadingReset(false);

      setModal({
        open: true,
        message: "Password reset link has been sent to your email",
        type: "success",
      });
    } catch (err) {
      setLoadingReset(false);

      setModal({
        open: true,
        message: err.message || "Something went wrong",
        type: "error",
      });
    }
  };

  return (
    <>
      <div className="h-16 px-6 flex items-center justify-between bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
        <div className="text-lg font-semibold">Welcome, {firstName}</div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition">
            <Bell size={18} />
          </button>

          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                {user?.userImageUrl ? (
                  <div className="relative w-8 h-8">
                    <Image
                      src={user.userImageUrl}
                      alt="User Avatar"
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <User size={16} />
                )}
              </div>
            </div>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-2 z-50">
                <p className="text-center text-sm font-medium px-4 py-2">
                  Welcome, {firstName}
                </p>

                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                <button
                  onClick={handleOpenProfile}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <UserCircle size={16} />
                  Profile
                </button>

                <button
                  onClick={handleForgotPassword}
                  disabled={loadingReset}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Key size={16} />
                  {loadingReset ? "Sending..." : "Change Password"}
                </button>

                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AutoCloseModal
        open={modal.open}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ open: false, message: "", type: "success" })}
      />

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      <GlobalLoader open={loadingReset} text="Sending reset link..." />
    </>
  );
}
