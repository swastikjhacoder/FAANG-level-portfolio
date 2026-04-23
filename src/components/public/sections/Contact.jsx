"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import Input from "@/components/dashboard/ui/Input";
import Button from "@/components/dashboard/ui/Button";
import AutoCloseModal from "@/components/dashboard/ui/AutoCloseModal";

const Contact = ({ data }) => {
  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const isFormValid = useMemo(() => {
    return (
      form.name.trim() &&
      form.email.trim() &&
      form.subject.trim() &&
      form.message.trim()
    );
  }, [form]);

  if (!data) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    try {
      const res = await fetch("/api/v1/contact/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setModal({
        open: true,
        type: "success",
        message: "Message sent successfully!",
      });

      setForm({
        name: "",
        role: "",
        company: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch {
      setModal({
        open: true,
        type: "error",
        message: "Failed to send message.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AutoCloseModal
        open={modal.open}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="p-6 rounded-2xl border border-[var(--glass-border)] bg-[var(--card-bg)] backdrop-blur-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Contact Info</h3>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[var(--text-secondary)]">Email</p>
                <p className="font-medium">{data.email}</p>
              </div>

              <div>
                <p className="text-[var(--text-secondary)]">Phone</p>
                <p className="font-medium">{data.mobile}</p>
              </div>

              <div>
                <p className="text-[var(--text-secondary)]">Address</p>
                <p className="font-medium leading-relaxed">{data.address}</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--glass-border)] bg-[var(--card-bg)] backdrop-blur-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Connect</h3>

            <div className="flex flex-wrap gap-3">
              {data.socials?.map((s) => (
                <a
                  key={s._id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--glass-border)] hover:bg-[var(--hover-bg)] transition-all duration-200 hover:scale-[1.03]"
                >
                  {s.icon?.url && (
                    <Image
                      src={s.icon.url}
                      alt={s.name}
                      width={18}
                      height={18}
                    />
                  )}
                  <span className="text-sm font-medium">{s.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl border border-[var(--glass-border)] bg-[var(--card-bg)] backdrop-blur-xl shadow-sm space-y-5"
        >
          <h3 className="text-xl font-semibold">Send a Message</h3>

          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            label="Your Name"
            required
          />
          <Input
            name="role"
            value={form.role}
            onChange={handleChange}
            label="Your Role"
          />
          <Input
            name="company"
            value={form.company}
            onChange={handleChange}
            label="Company"
          />
          <Input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            label="Email Address"
            required
          />
          <Input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            label="Subject"
            required
          />
          <Input
            textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            label="Message"
            rows={5}
            required
          />

          <Button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-3"
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </>
  );
};

export default Contact;