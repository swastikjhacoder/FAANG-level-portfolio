"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { dashboardRoutes } from "@/config/dashboardRoutes";
import { useAuthStore } from "@/store/useAuthStore";
import Button from "@/components/dashboard/ui/Button";
import Input from "@/components/dashboard/ui/Input";
import Modal from "@/components/dashboard/ui/Modal";
import { useProfile } from "@/modules/profile/hooks/useProfile";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  TableEmpty,
} from "@/components/dashboard/ui/Table";
import { secureFetch } from "@/shared/lib/secureFetch";

export default function ExperiencePage() {
  const route = dashboardRoutes.find((r) => r.href === "/dashboard/experience");

  const { user, hydrated } = useAuthStore();
  const { profile, loading: profileLoading } = useProfile();

  const profileId = profile?._id;

  const [experiences, setExperiences] = useState([]);

  const [section, setSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    heading: "",
    subHeading: "",
    description: "",
  });

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);

  const [form, setForm] = useState({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    history: "",
    achievements: "",
    projects: "",
  });

  const validators = {
    company: (v) => (!v ? "Required" : null),
    role: (v) => (!v ? "Required" : null),
    startDate: (v) => (!v ? "Required" : null),
  };

  const sectionValidators = {
    heading: (v) => (!v ? "Required" : null),
    subHeading: (v) => (!v ? "Required" : null),
    description: (v) => (!v || v.length < 10 ? "Min 10 chars" : null),
  };

  useEffect(() => {
    if (!hydrated || !profileId) return;

    let isMounted = true;

    (async () => {
      try {
        const [json1, json2] = await Promise.all([
          secureFetch(`/api/v1/profile/experience?profileId=${profileId}`),
          secureFetch(
            `/api/v1/profile/experienceSection?profileId=${profileId}`,
          ),
        ]);

        setExperiences(json1.data || []);

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

  const refetch = async () => {
    const res = await secureFetch(
      `/api/v1/profile/experience?profileId=${profileId}`,
    );
    setExperiences(res.data || []);
  };

  const handleSectionSubmit = async () => {
    if (
      sectionValidators.heading(sectionForm.heading) ||
      sectionValidators.subHeading(sectionForm.subHeading) ||
      sectionValidators.description(sectionForm.description)
    )
      return;

    const method = section ? "PATCH" : "POST";

    await secureFetch(`/api/v1/profile/experienceSection`, {
      method,
      body: JSON.stringify({ profileId, ...sectionForm }),
    });

    const res = await secureFetch(
      `/api/v1/profile/experienceSection?profileId=${profileId}`,
    );

    setSection(res.data);
    setIsSectionModalOpen(false);
  };

  const openAdd = () => {
    setEditingExp(null);
    setForm({
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      history: "",
      achievements: "",
      projects: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (exp) => {
    setEditingExp(exp);
    setForm({
      company: exp.company,
      role: exp.role,
      startDate: exp.startDate?.substring(0, 10),
      endDate: exp.endDate?.substring(0, 10) || "",
      history: exp.history?.join(", "),
      achievements: exp.achievements?.join(", "),
      projects: exp.projects?.join(", "),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (
      validators.company(form.company) ||
      validators.role(form.role) ||
      validators.startDate(form.startDate)
    )
      return;

    const payload = {
      profileId,
      company: form.company,
      role: form.role,
      startDate: form.startDate,
      endDate: form.endDate || null,
      history: form.history.split(",").map((i) => i.trim()),
      achievements: form.achievements.split(",").map((i) => i.trim()),
      projects: form.projects.split(",").map((i) => i.trim()),
    };

    const url = editingExp
      ? `/api/v1/profile/experience?experienceId=${editingExp._id}`
      : `/api/v1/profile/experience`;

    const method = editingExp ? "PATCH" : "POST";

    await secureFetch(url, {
      method,
      body: JSON.stringify(payload),
    });

    setIsModalOpen(false);
    await refetch();
  };

  const handleDelete = async (id) => {
    await secureFetch(`/api/v1/profile/experience?experienceId=${id}`, {
      method: "DELETE",
    });
    await refetch();
  };

  if (!hydrated) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader title={route.name} icon={route.icon} />

      <div className="border-t border-[var(--glass-border)]" />

      <div className="rounded-xl p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-color)]">
            Experience Section
          </h2>
          <Button onClick={() => setIsSectionModalOpen(true)}>
            {section ? "Edit" : "Add"}
          </Button>
        </div>

        {section && (
          <div className="mt-4 space-y-3">
            <div>
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                Heading
              </span>
              <h3 className="font-semibold text-[var(--text-color)]">
                {section.heading}
              </h3>
            </div>

            <div>
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                Sub Heading
              </span>
              <p className="text-sm text-[var(--text-muted)]">
                {section.subHeading}
              </p>
            </div>

            <div>
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                Description
              </span>
              <p className="mt-1 text-[var(--text-color)] leading-relaxed">
                {section.description}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
        <div className="p-4 flex justify-between">
          <h2 className="text-lg font-semibold">Experiences</h2>
          <Button size="sm" onClick={openAdd}>
            ➕ Add Experience
          </Button>
        </div>

        <div className="p-4 border-t border-[var(--glass-border)]">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-[33%]">Company</TableHeaderCell>
                <TableHeaderCell className="w-[33%] text-center">
                  Role
                </TableHeaderCell>
                <TableHeaderCell className="w-[33%] text-center">
                  Duration
                </TableHeaderCell>
                <TableHeaderCell className="w-30 text-center">
                  Action
                </TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {experiences.length === 0 && <TableEmpty colSpan={4} />}

              {experiences.map((exp) => (
                <TableRow key={exp._id}>
                  <TableCell>{exp.company}</TableCell>
                  <TableCell className="text-center">{exp.role}</TableCell>
                  <TableCell className="text-center">
                    {new Date(exp.startDate).getFullYear()} -{" "}
                    {exp.endDate
                      ? new Date(exp.endDate).getFullYear()
                      : "Present"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(exp)}
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(exp._id)}
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
        title={section ? "Edit Experience Section" : "Add Experience Section"}
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
            value={sectionForm.heading}
            onChange={(e) =>
              setSectionForm({ ...sectionForm, heading: e.target.value })
            }
            validate={sectionValidators.heading}
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
            validate={sectionValidators.subHeading}
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
            validate={sectionValidators.description}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExp ? "Edit Experience" : "Add Experience"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingExp ? "Update" : "Add"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <Input
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
          <Input
            type="text"
            label="Start Date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <Input
            type="text"
            label="End Date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
          <Input
            label="History (comma separated)"
            value={form.history}
            onChange={(e) => setForm({ ...form, history: e.target.value })}
          />
          <Input
            label="Achievements (comma separated)"
            value={form.achievements}
            onChange={(e) => setForm({ ...form, achievements: e.target.value })}
          />
          <Input
            label="Projects (comma separated)"
            value={form.projects}
            onChange={(e) => setForm({ ...form, projects: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
