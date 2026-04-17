"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/dashboard/ui/Button";
import Input from "@/components/dashboard/ui/Input";
import { validators } from "@/utils/validators";
import { Check, X } from "lucide-react";

export default function ResetPasswordForm({ token }) {
  const router = useRouter();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const password = form.password;

  const policies = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "At least one uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "At least one lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "At least one number",
      valid: /[0-9]/.test(password),
    },
    {
      label: "At least one special character",
      valid: /[!@#$%^&*(),.?\":{}|<>]/.test(password),
    },
  ];

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      return setError("Invalid reset link");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setSuccess("Password reset successful. Redirecting...");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="New Password"
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        validate={validators.password}
      />

      <div className="space-y-2 text-sm">
        {policies.map((policy, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 ${
              policy.valid
                ? "text-green-600 dark:text-green-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {policy.valid ? <Check size={16} /> : <X size={16} />}
            <span>{policy.label}</span>
          </div>
        ))}
      </div>

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={handleChange}
        validate={validators.password}
      />

      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

      {success && (
        <p className="text-sm text-green-500 font-medium">{success}</p>
      )}

      <Button type="submit" loading={loading} fullWidth>
        Reset Password
      </Button>
    </form>
  );
}
