"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardThemeStore } from "@/store/useDashboardThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  Key,
  UserCircle,
  Menu,
} from "lucide-react";
import Image from "next/image";
import ProfileModal from "@/components/dashboard/profile/ProfileModal";
import AutoCloseModal from "../ui/AutoCloseModal";
import GlobalLoader from "@/components/shared/GlobalLoader";

export default function Header({ collapsed, setCollapsed, setMobileOpen }) {
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

      if (!res.ok) throw new Error(data.message);

      setModal({
        open: true,
        message: "Password reset link sent",
        type: "success",
      });
    } catch (err) {
      setModal({
        open: true,
        message: err.message || "Error",
        type: "error",
      });
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <>
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.innerWidth < 640) {
                setMobileOpen(true);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu size={18} />
          </button>

          <div className="text-sm sm:text-lg font-semibold">
            Welcome, {firstName}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Bell size={18} />
          </button>

          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsOpen((prev) => !prev)}
              className="cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300">
                {user?.userImageUrl ? (
                  <div className="relative w-8 h-8">
                    <Image
                      src={user.userImageUrl}
                      alt="User"
                      fill
                      sizes="32px"
                      className="rounded-full object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <User size={16} />
                )}
              </div>
            </div>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-gray-800 border py-2 z-50">
                <button
                  onClick={handleOpenProfile}
                  className="w-full px-4 py-2 text-sm flex gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <UserCircle size={16} /> Profile
                </button>

                <button
                  onClick={handleForgotPassword}
                  className="w-full px-4 py-2 text-sm flex gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Key size={16} /> Change Password
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm text-red-500 flex gap-2 hover:bg-red-50"
                >
                  <LogOut size={16} /> Logout
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
        onClose={() => setModal({ open: false })}
      />

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      <GlobalLoader open={loadingReset} text="Sending..." />
    </>
  );
}
