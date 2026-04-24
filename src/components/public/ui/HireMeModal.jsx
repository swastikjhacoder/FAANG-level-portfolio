"use client";

import { useEffect, useState } from "react";
import Input from "@/components/dashboard/ui/Input";
import Button from "@/components/dashboard/ui/Button";
import AutoCloseModal from "@/components/dashboard/ui/AutoCloseModal";

export default function HireMeModal({ open, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const defaultMessage = `Hi Swastik,

I would like to discuss a project with you.

Project Details:
- Type: (Web App / Portfolio / SaaS / API / etc.)
- Description:
- Tech Preference (if any):
- Timeline:
- Budget:

Please let me know your availability.

Thanks!`;

  const whatsappMessage = encodeURIComponent(`Hi Swastik,

I saw your portfolio and would like to discuss a project.

Project Details:
- Type:
- Description:
- Timeline:
- Budget:
`);

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        message: defaultMessage,
      }));
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email";
    if (!form.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/contact/hire-me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      setToast({
        open: true,
        message: "Message sent successfully 🚀",
        type: "success",
      });

      onClose();
      setForm({ name: "", email: "", message: "" });
      setErrors({});
    } catch {
      setToast({
        open: true,
        message: "Failed to send message ❌",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AutoCloseModal
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      <div
        onClick={onClose}
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-white/20 backdrop-blur-sm"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg mx-4 rounded-2xl p-6 bg-[var(--surface-strong)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)] backdrop-blur-xl"
        >
          <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-[var(--glass-highlight)] to-transparent opacity-10" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text-color)] transition"
          >
            ✕
          </button>

          <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
            Start a Project 🚀
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Your Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />

            <Input
              label="Your Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="Project Details"
              name="message"
              textarea
              rows={8}
              value={form.message}
              onChange={handleChange}
              error={errors.message}
            />

            <Button
              type="submit"
              loading={loading}
              fullWidth
              className="gradient-bg text-white"
            >
              Send Message
            </Button>

            <p className="text-xs text-[var(--text-muted)] text-center">
              Prefer quick chat?{" "}
              <a
                href={`https://wa.me/919674910207?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[var(--text-color)] transition"
              >
                WhatsApp
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
