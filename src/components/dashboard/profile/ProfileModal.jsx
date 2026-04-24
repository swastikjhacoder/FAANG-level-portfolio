"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfileModal({ onClose }) {
  const { user, updateProfile } = useAuthStore();

  const fileInputRef = useRef(null);

  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.name?.firstName || "",
    lastName: user?.name?.lastName || "",
    email: user?.email || "",
    password: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(user?.userImageUrl || "");
  const [imageLoading, setImageLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (preview && image) URL.revokeObjectURL(preview);
    };
  }, [preview, image]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAvatarClick = () => {
    if (!imageLoading) fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image");
      return;
    }

    setImageLoading(true);
    setError("");

    setTimeout(() => {
      if (preview && image) URL.revokeObjectURL(preview);

      const objectUrl = URL.createObjectURL(file);

      setImage(file);
      setPreview(objectUrl);
      setImageLoading(false);
    }, 300);
  };

  const handleSave = async () => {
    setError("");

    if (!form.firstName || !form.lastName) {
      setError("First name and last name are required");
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        image,
      });

      onClose();
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className="relative w-105 rounded-xl p-6 space-y-5
        bg-white dark:bg-gray-900
        text-gray-900 dark:text-gray-100
        shadow-2xl"
      >
        <h2 className="text-lg font-semibold text-center">Profile Settings</h2>

        <div className="flex flex-col items-center gap-3">
          <div
            onClick={handleAvatarClick}
            className="relative w-24 h-24 rounded-full cursor-pointer group overflow-hidden
            bg-gray-300 dark:bg-gray-700 flex items-center justify-center"
          >
            {imageLoading ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            ) : preview ? (
              <img
                src={preview}
                alt="avatar"
                className="w-24 h-24 object-cover rounded-full"
              />
            ) : (
              <span className="text-xs">Upload</span>
            )}

            {!imageLoading && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white transition">
                Change Photo
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div className="space-y-3">
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full p-2 rounded-lg border dark:border-gray-700 bg-transparent"
          />

          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full p-2 rounded-lg border dark:border-gray-700 bg-transparent"
          />

          <input
            value={form.email}
            disabled
            className="w-full p-2 rounded-lg border bg-gray-100 dark:bg-gray-800 text-gray-500"
          />

          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Role</label>
            <div className="w-full p-2 rounded-lg border bg-gray-100 dark:bg-gray-800 text-gray-500 capitalize">
              {user?.roles || "N/A"}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border dark:border-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-lg bg-black text-white"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
