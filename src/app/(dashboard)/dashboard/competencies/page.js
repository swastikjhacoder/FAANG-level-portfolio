"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { dashboardRoutes } from "@/config/dashboardRoutes";
import { useAuthStore } from "@/store/useAuthStore";
import Button from "@/components/dashboard/ui/Button";
import Input from "@/components/dashboard/ui/Input";
import Modal from "@/components/dashboard/ui/Modal";
import { useProfile } from "@/modules/profile/hooks/useProfile";
import { secureFetch } from "@/shared/lib/secureFetch";

const DEFAULT_SECTION = {
  heading: "Core Competencies",
  subHeading: "Key strengths and areas of expertise",
  description:
    "A concise overview of my technical skills, problem-solving abilities, and professional strengths.",
};

export default function CompetenciesPage() {
  const route = dashboardRoutes.find(
    (r) => r.href === "/dashboard/competencies",
  );

  const { hydrated } = useAuthStore();
  const { profile } = useProfile();

  const profileId = profile?._id;

  const [loaded, setLoaded] = useState(false);

  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ items: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [section, setSection] = useState(null);
  const [sectionForm, setSectionForm] = useState(DEFAULT_SECTION);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  useEffect(() => {
    if (!hydrated || !profileId || loaded) return;

    setLoaded(true);

    (async () => {
      try {
        const [compRes, sectionRes] = await Promise.all([
          secureFetch(`/api/v1/profile/coreCompetency?profileId=${profileId}`),
          secureFetch(
            `/api/v1/profile/coreCompetencySection?profileId=${profileId}`,
          ),
        ]);

        const value = compRes.data?.items || [];
        setItems(value);
        setForm({ items: value.join("\n") });

        if (sectionRes.data) {
          setSection(sectionRes.data);
          setSectionForm({
            heading: sectionRes.data.heading || DEFAULT_SECTION.heading,
            subHeading:
              sectionRes.data.subHeading || DEFAULT_SECTION.subHeading,
            description:
              sectionRes.data.description || DEFAULT_SECTION.description,
          });
        } else {
          setSection(null);
          setSectionForm(DEFAULT_SECTION);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [hydrated, profileId, loaded]);

  const refetch = async () => {
    const res = await secureFetch(
      `/api/v1/profile/coreCompetency?profileId=${profileId}`,
    );

    const value = res.data?.items || [];
    setItems(value);
    setForm({ items: value.join("\n") });
  };

  const openEdit = () => {
    setForm({ items: items.join("\n") });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const parsedItems = form.items
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);

    if (parsedItems.length === 0) return;

    setLoading(true);

    try {
      await secureFetch(`/api/v1/profile/coreCompetency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          items: parsedItems,
        }),
      });

      setIsModalOpen(false);
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSubmit = async () => {
    await secureFetch(`/api/v1/profile/coreCompetencySection`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sectionForm),
    });

    const sectionRes = await secureFetch(
      `/api/v1/profile/coreCompetencySection`,
    );

    setSection(sectionRes.data);
    setSectionForm({
      heading: sectionRes.data.heading,
      subHeading: sectionRes.data.subHeading,
      description: sectionRes.data.description,
    });

    setIsSectionModalOpen(false);
  };

  const displaySection = section || DEFAULT_SECTION;

  if (!hydrated) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader title={route?.name} icon={route?.icon} />

      <div className="border-t border-[var(--glass-border)]" />

      <div className="rounded-xl p-4 bg-[var(--glass-bg)] border shadow-[var(--glass-shadow)]">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Core Competency Section</h2>
          <Button onClick={() => setIsSectionModalOpen(true)}>
            {section ? "Edit" : "Customize"}
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <span className="text-xs text-[var(--text-muted)] uppercase">
              Heading
            </span>
            <h3 className="font-semibold">{displaySection.heading}</h3>
          </div>

          <div>
            <span className="text-xs text-[var(--text-muted)] uppercase">
              Sub Heading
            </span>
            <p className="text-sm text-[var(--text-muted)]">
              {displaySection.subHeading}
            </p>
          </div>

          <div>
            <span className="text-xs text-[var(--text-muted)] uppercase">
              Description
            </span>
            <p>{displaySection.description}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 bg-[var(--glass-bg)] border shadow-[var(--glass-shadow)]">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Core Competency</h2>
          <Button size="sm" onClick={openEdit}>
            {items.length > 0 ? "Edit" : "Add"}
          </Button>
        </div>

        {items.length > 0 && (
          <ul className="mt-4 space-y-2 list-disc pl-5 text-sm">
            {items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title="Edit Core Competency Section"
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
            label="Sub Heading"
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
        title="Edit Core Competency"
        footer={
          <>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <Input
          label="Competencies (one per line)"
          textarea
          rows={6}
          value={form.items}
          onChange={(e) => setForm({ items: e.target.value })}
        />
      </Modal>
    </div>
  );
}
