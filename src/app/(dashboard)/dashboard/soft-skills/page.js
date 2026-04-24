"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { dashboardRoutes } from "@/config/dashboardRoutes";
import { useAuthStore } from "@/store/useAuthStore";
import Button from "@/components/dashboard/ui/Button";
import Input from "@/components/dashboard/ui/Input";
import Modal from "@/components/dashboard/ui/Modal";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  TableEmpty,
} from "@/components/dashboard/ui/Table";
import { requestWithCsrf } from "@/shared/lib/apiClient";

export default function SoftSkillsPage() {
  const route = dashboardRoutes.find(
    (r) => r.href === "/dashboard/soft-skills",
  );

  const { profile, hydrated } = useAuthStore();
  const profileId = profile?._id;

  const [softSkills, setSoftSkills] = useState([]);

  const [section, setSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    heading: "",
    subHeading: "",
    description: "",
  });

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [items, setItems] = useState([]);

  const sectionValidators = {
    heading: (v) => (!v ? "Required" : null),
    description: (v) => (v && v.length < 10 ? "Min 10 characters" : null),
  };

  useEffect(() => {
    if (!hydrated || !profileId) return;

    let mounted = true;

    (async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`/api/v1/profile/softSkill?profileId=${profileId}`),
          fetch(`/api/v1/profile/softSkillSection`),
        ]);

        const json1 = await res1.json();
        const json2 = await res2.json();

        if (!mounted) return;

        setSoftSkills(json1.data?.items || []);

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

    return () => (mounted = false);
  }, [hydrated, profileId]);

  const refetch = async () => {
    const res = await fetch(`/api/v1/profile/softSkill?profileId=${profileId}`);
    const json = await res.json();
    setSoftSkills(json.data?.items || []);
  };

  const addItem = () => {
    if (!inputValue.trim()) return;

    if (items.length >= 20) return;

    if (items.includes(inputValue.trim().toLowerCase())) return;

    setItems([...items, inputValue.trim()]);
    setInputValue("");
  };

  const removeItem = (item) => {
    setItems(items.filter((i) => i !== item));
  };

  const handleSubmit = async () => {
    if (!profileId) return;

    await requestWithCsrf(`/api/v1/profile/softSkill`, "POST", {
      profileId,
      items,
    });

    setIsModalOpen(false);
    setItems([]);
    await refetch();
  };

  const handleDelete = async () => {
    await requestWithCsrf(
      `/api/v1/profile/softSkill?profileId=${profileId}`,
      "DELETE",
    );
    await refetch();
  };

  const handleSectionSubmit = async () => {
    if (sectionValidators.heading(sectionForm.heading)) return;

    await requestWithCsrf(
      `/api/v1/profile/softSkillSection`,
      "POST",
      sectionForm,
    );

    setSection(sectionForm);
    setIsSectionModalOpen(false);
  };

  if (!hydrated) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader title={route?.name} icon={route?.icon} />

      <div className="rounded-xl p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold">Soft Skills Section</h2>
          <Button onClick={() => setIsSectionModalOpen(true)}>
            {section ? "Edit" : "Add"}
          </Button>
        </div>

        {section && (
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">{section.heading}</h3>
            <p className="text-sm text-[var(--text-muted)]">
              {section.subHeading}
            </p>
            <p>{section.description}</p>
          </div>
        )}
      </div>

      {/* 🔹 SKILLS */}
      <div className="rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <div className="p-4 flex justify-between">
          <h2 className="text-lg font-semibold">Soft Skills</h2>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              ➕ Add
            </Button>
            <Button size="sm" variant="danger" onClick={handleDelete}>
              🗑 Clear
            </Button>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--glass-border)]">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Skill</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {softSkills.length === 0 && <TableEmpty colSpan={1} />}

              {softSkills.map((skill) => (
                <TableRow key={skill}>
                  <TableCell>{skill}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Soft Skills"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter skill"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button onClick={addItem}>Add</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item}
                className="px-3 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-2"
              >
                {item}
                <button onClick={() => removeItem(item)}>✕</button>
              </span>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title="Edit Section"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsSectionModalOpen(false)}
            >
              Cancel
            </Button>
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
    </div>
  );
}
