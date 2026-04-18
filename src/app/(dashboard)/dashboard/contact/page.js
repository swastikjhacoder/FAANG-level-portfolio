"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { dashboardRoutes } from "@/config/dashboardRoutes";
import { useAuthStore } from "@/store/useAuthStore";
import Button from "@/components/dashboard/ui/Button";
import Input from "@/components/dashboard/ui/Input";
import Modal from "@/components/dashboard/ui/Modal";
import Image from "next/image";

export default function ContactPage() {
  const route = dashboardRoutes.find((r) => r.href === "/dashboard/contact");

  const { user, hydrated } = useAuthStore();
  const profileId = user?.profileId;

  const [contact, setContact] = useState(null);

  const [section, setSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    heading: "",
    subHeading: "",
    description: "",
  });

  const [form, setForm] = useState({
    email: "",
    mobile: "",
    address: "",
    socials: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  const validators = {
    email: (v) => {
      if (!v) return null;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Invalid email";
    },
  };

  useEffect(() => {
    if (!hydrated || !profileId) return;

    let isMounted = true;

    (async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`/api/v1/profile/contact?profileId=${profileId}`),
          fetch(`/api/v1/profile/contactSection?profileId=${profileId}`),
        ]);

        const json1 = await res1.json();
        const json2 = await res2.json();

        if (!isMounted) return;

        if (json1.data) {
          setContact(json1.data);
          setForm({
            email: json1.data.email || "",
            mobile: json1.data.mobile || "",
            address: json1.data.address || "",
            socials: json1.data.socials || [],
          });
        }

        if (json2.data) {
          setSection(json2.data);
          setSectionForm({
            heading: json2.data.heading || "",
            subHeading: json2.data.subHeading || "",
            description: json2.data.description || "",
          });
        }
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [hydrated, profileId]);

  const handleSubmit = async () => {
    if (validators.email(form.email)) return;

    const formData = new FormData();

    formData.append("profileId", profileId);
    formData.append("email", form.email);
    formData.append("mobile", form.mobile);
    formData.append("address", form.address);
    formData.append("socials", JSON.stringify(form.socials));

    form.socials.forEach((s, i) => {
      if (s.iconFile) {
        formData.append(`socialIcon_${i}`, s.iconFile);
      }
    });

    const url = contact
      ? `/api/v1/profile/contact?contactId=${contact._id}`
      : `/api/v1/profile/contact`;

    const method = contact ? "PATCH" : "POST";

    await fetch(url, { method, body: formData });

    setIsModalOpen(false);
    location.reload();
  };

  const handleSectionSubmit = async () => {
    const method = section ? "PATCH" : "POST";

    await fetch(`/api/v1/profile/contactSection`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, ...sectionForm }),
    });

    setIsSectionModalOpen(false);
    location.reload();
  };

  const addSocial = () => {
    setForm({
      ...form,
      socials: [...form.socials, { name: "", url: "" }],
    });
  };

  const updateSocial = (i, key, value) => {
    const updated = [...form.socials];
    updated[i][key] = value;
    setForm({ ...form, socials: updated });
  };

  const removeSocial = (i) => {
    const updated = form.socials.filter((_, idx) => idx !== i);
    setForm({ ...form, socials: updated });
  };

  if (!hydrated) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader title={route.name} icon={route.icon} />

      <div className="border-t border-[var(--glass-border)]" />

      <div className="rounded-xl p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-color)]">
            Contact Section
          </h2>
          <Button onClick={() => setIsSectionModalOpen(true)}>
            {section ? "Edit" : "Add"}
          </Button>
        </div>

        {section && (
          <div className="mt-3">
            <h3>{section.heading}</h3>
            <p className="text-sm text-[var(--text-muted)]">
              {section.subHeading}
            </p>
            <p className="mt-2">{section.description}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold">Contact Info</h2>
          <Button onClick={() => setIsModalOpen(true)}>
            {contact ? "Edit" : "Add"}
          </Button>
        </div>

        {contact && (
          <div className="mt-3 space-y-2 text-sm">
            <div>Email: {contact.email}</div>
            <div>Mobile: {contact.mobile}</div>
            <div>Address: {contact.address}</div>

            <div className="flex gap-3 mt-2">
              {contact.socials?.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  {s.icon?.url && (
                    <div className="relative w-5 h-5">
                      <Image
                        src={s.icon.url}
                        alt={s.name}
                        fill
                        sizes="(max-width: 768px) 20px, 20px"
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title={section ? "Edit Contact Section" : "Add Contact Section"}
        footer={
          <>
            <Button onClick={() => setIsSectionModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSectionSubmit}>Save</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Heading"
            value={sectionForm.heading}
            onChange={(e) =>
              setSectionForm({ ...sectionForm, heading: e.target.value })
            }
          />
          <Input
            label="SubHeading"
            value={sectionForm.subHeading}
            onChange={(e) =>
              setSectionForm({
                ...sectionForm,
                subHeading: e.target.value,
              })
            }
          />
          <Input
            label="Description"
            textarea
            value={sectionForm.description}
            onChange={(e) =>
              setSectionForm({
                ...sectionForm,
                description: e.target.value,
              })
            }
          />
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={contact ? "Edit Contact Info" : "Add Contact Info"}
        footer={
          <>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            validate={validators.email}
          />
          <Input
            label="Mobile"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />
          <Input
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <div className="space-y-2">
            <div className="flex justify-between">
              <h3 className="text-sm">Socials</h3>
              <Button size="sm" onClick={addSocial}>
                ➕
              </Button>
            </div>

            {form.socials.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  placeholder="Name"
                  value={s.name}
                  onChange={(e) => updateSocial(i, "name", e.target.value)}
                />
                <Input
                  placeholder="URL"
                  value={s.url}
                  onChange={(e) => updateSocial(i, "url", e.target.value)}
                />
                <input
                  type="file"
                  onChange={(e) =>
                    updateSocial(i, "iconFile", e.target.files[0])
                  }
                  className="text-xs text-[var(--text-color)]"
                />
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => removeSocial(i)}
                >
                  ❌
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
