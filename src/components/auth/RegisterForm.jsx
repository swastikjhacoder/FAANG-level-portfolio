"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Button from "@/components/dashboard/ui/Button";
import Input from "@/components/dashboard/ui/Input";
import Loader from "@/components/shared/Loader";
import { validators } from "@/utils/validators";
import AutoCloseModal from "@/components/dashboard/ui/AutoCloseModal";

export default function RegisterForm() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [modal, setModal] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

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

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image");
      return;
    }

    setImageLoading(true);

    setTimeout(() => {
      if (preview) URL.revokeObjectURL(preview);

      const objectUrl = URL.createObjectURL(file);

      setImage(file);
      setPreview(objectUrl);
      setImageLoading(false);
    }, 400);
  };

  const validateForm = () => {
    if (!form.firstName) return "First name is required";
    if (!form.lastName) return "Last name is required";

    const emailError = validators.email(form.email);
    if (emailError) return emailError;

    const passwordError = validators.password(form.password);
    if (passwordError) return passwordError;

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        image,
      });

      setModal({
        open: true,
        message: "Verification email sent. Please check your inbox.",
        type: "success",
      });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AutoCloseModal
        open={modal.open}
        message={modal.message}
        type={modal.type}
        onClose={() => {
          setModal({ open: false, message: "", type: "success" });
          router.replace("/login");
        }}
      />

      {loading && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <Loader fullScreen />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <label className="text-sm text-gray-300">Profile Image</label>

          <div
            onClick={handleAvatarClick}
            className="relative w-20 h-20 cursor-pointer group"
          >
            {imageLoading ? (
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-800 border border-gray-700">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
              </div>
            ) : preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover border border-gray-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 text-xs border border-gray-700">
                Upload
              </div>
            )}

            {!imageLoading && (
              <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white text-center px-2 transition">
                {preview ? "Change Photo" : "Upload Photo"}
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

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            validate={validators.firstName}
          />

          <Input
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            validate={validators.lastName}
          />
        </div>

        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          validate={validators.email}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          validate={validators.password}
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          validate={validators.password}
        />

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        <Button type="submit" loading={loading} fullWidth>
          Register
        </Button>
      </form>
    </>
  );
}
