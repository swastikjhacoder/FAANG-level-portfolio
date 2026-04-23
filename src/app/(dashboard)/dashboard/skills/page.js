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
import Image from "next/image";
import { requestWithCsrf } from "@/shared/lib/apiClient";

export default function SkillsPage() {
  const route = dashboardRoutes.find((r) => r.href === "/dashboard/skills");

  const { profile, hydrated } = useAuthStore();
  const profileId = profile?._id;

  const [skills, setSkills] = useState([]);

  const [section, setSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    heading: "",
    subHeading: "",
    description: "",
  });

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  const [form, setForm] = useState({
    name: "",
    experience: "",
    proficiency: "",
    icon: null,
  });

  const validators = {
    name: (v) => {
      if (!v || !v.trim()) return "Skill name is required";
      if (v.length < 2) return "Minimum 2 characters required";
      return null;
    },
    experience: (v) => {
      if (!v) return null;
      const num = Number(v);
      if (num < 0 || num > 50) return "0 - 50 allowed";
      return null;
    },
    proficiency: (v) => {
      if (!v) return "Required";
      const num = Number(v);
      if (num < 0 || num > 10) return "0 - 10 allowed";
      return null;
    },
  };

  const sectionValidators = {
    heading: (v) => (!v ? "Required" : null),
    subHeading: () => null,
    description: (v) => (!v || v.length < 10 ? "Min 10 chars" : null),
  };

  useEffect(() => {
    if (!hydrated || !profile?._id) return;

    let isMounted = true;

    (async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`/api/v1/profile/skill?profileId=${profileId}`),
          fetch(`/api/v1/profile/skillSection`),
        ]);

        const json1 = await res1.json();
        const json2 = await res2.json();

        if (!isMounted) return;

        setSkills(json1.data || []);

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
  }, [hydrated, profile, profileId]);

  const refetchSkills = async () => {
    const res = await fetch(`/api/v1/profile/skill?profileId=${profileId}`);
    const json = await res.json();
    setSkills(json.data || []);
  };

  const handleSectionSubmit = async () => {
    const errors = {
      heading: sectionValidators.heading(sectionForm.heading),
      description: sectionValidators.description(sectionForm.description),
    };

    if (errors.heading || errors.description) return;

    await requestWithCsrf(`/api/v1/profile/skillSection`, "PATCH", {
      ...sectionForm,
    });

    setSection(sectionForm);
    setIsSectionModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) setForm({ ...form, [name]: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const openAdd = () => {
    setEditingSkill(null);
    setForm({
      name: "",
      experience: "",
      proficiency: "",
      icon: null,
    });
    setIsModalOpen(true);
  };

  const openEdit = (skill) => {
    setEditingSkill(skill);
    setForm({
      name: skill.name,
      experience: skill.experience || "",
      proficiency: skill.proficiency || "",
      icon: null,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (validators.name(form.name) || validators.proficiency(form.proficiency))
      return;

    if (!profile?._id) {
      alert("Profile not loaded yet");
      return;
    }

    const formData = new FormData();
    formData.append("profileId", profileId);
    formData.append("name", form.name);
    formData.append("experience", form.experience || 0);
    formData.append("proficiency", form.proficiency);
    if (form.icon) formData.append("icon", form.icon);

    const url = editingSkill
      ? `/api/v1/profile/skill?skillId=${editingSkill._id}`
      : `/api/v1/profile/skill`;

    const method = editingSkill ? "PATCH" : "POST";

    await requestWithCsrf(url, method, formData);

    setIsModalOpen(false);
    await refetchSkills();
  };

  const handleDelete = async (id) => {
    await requestWithCsrf(`/api/v1/profile/skill?skillId=${id}`, "DELETE");
    await refetchSkills();
  };

  if (!hydrated) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader title={route.name} icon={route.icon} />

      <div className="border-t border-[var(--glass-border)]" />

      <div className="rounded-xl p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-color)]">
            Skills Section
          </h2>
          <Button onClick={() => setIsSectionModalOpen(true)}>
            {section ? "Edit" : "Add"}
          </Button>
        </div>

        {section && (
          <div className="mt-4 space-y-2">
            <div>
              <span className="text-xs text-[var(--text-muted)]">Heading</span>
              <h3 className="font-semibold">{section.heading}</h3>
            </div>

            <div>
              <span className="text-xs text-[var(--text-muted)]">
                Sub Heading
              </span>
              <p className="text-sm text-[var(--text-muted)]">
                {section.subHeading}
              </p>
            </div>

            <div>
              <span className="text-xs text-[var(--text-muted)]">
                Description
              </span>
              <p className="mt-1">{section.description}</p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
        <div className="p-4 flex justify-between">
          <h2 className="text-lg font-semibold">Skills</h2>
          <Button size="sm" onClick={openAdd}>
            ➕ Add Skill
          </Button>
        </div>

        <div className="p-4 border-t border-[var(--glass-border)]">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-[33%]">Skill</TableHeaderCell>
                <TableHeaderCell className="w-[33%] text-center">
                  Exp
                </TableHeaderCell>
                <TableHeaderCell className="w-[33%] text-center">
                  Prof
                </TableHeaderCell>
                <TableHeaderCell className="w-30 text-center">
                  Action
                </TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {skills.length === 0 && <TableEmpty colSpan={4} />}

              {skills.map((skill) => (
                <TableRow key={skill._id}>
                  <TableCell className="flex items-center gap-3">
                    {skill.icon?.url && (
                      <div className="relative w-6 h-6">
                        <Image
                          src={skill.icon.url}
                          alt={skill.name}
                          fill
                          sizes="(max-width: 768px) 24px, 24px"
                          className="object-contain"
                        />
                      </div>
                    )}
                    {skill.name}
                  </TableCell>

                  <TableCell className="text-center">
                    {skill.experience || "-"}
                  </TableCell>

                  <TableCell className="text-center">
                    {skill.proficiency}/10
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(skill)}
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(skill._id)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title={section ? "Edit Skills Section" : "Add Skills Section"}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsSectionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSectionSubmit}>
              {section ? "Update" : "Add"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Heading"
            name="heading"
            value={sectionForm.heading}
            onChange={(e) =>
              setSectionForm({
                ...sectionForm,
                heading: e.target.value,
              })
            }
            validate={sectionValidators.heading}
          />

          <Input
            label="Sub Heading"
            name="subHeading"
            value={sectionForm.subHeading}
            onChange={(e) =>
              setSectionForm({
                ...sectionForm,
                subHeading: e.target.value,
              })
            }
            validate={sectionValidators.subHeading}
          />

          <Input
            label="Description"
            textarea
            name="description"
            value={sectionForm.description}
            onChange={(e) =>
              setSectionForm({
                ...sectionForm,
                description: e.target.value,
              })
            }
            validate={sectionValidators.description}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSkill ? "Edit Skill" : "Add Skill"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingSkill ? "Update" : "Add"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Skill Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            validate={validators.name}
          />

          <Input
            label="Experience"
            name="experience"
            type="number"
            value={form.experience}
            onChange={handleChange}
            validate={validators.experience}
          />

          <Input
            label="Proficiency"
            name="proficiency"
            type="number"
            value={form.proficiency}
            onChange={handleChange}
            validate={validators.proficiency}
          />

          <input
            type="file"
            name="icon"
            onChange={handleChange}
            className="text-[var(--text-color)] text-sm"
          />
        </div>
      </Modal>
    </div>
  );
}
