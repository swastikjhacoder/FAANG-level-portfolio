"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { dashboardRoutes } from "@/config/dashboardRoutes";
import { useAuthStore } from "@/store/useAuthStore";
import Button from "@/components/dashboard/ui/Button";
import Input from "@/components/dashboard/ui/Input";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  TableEmpty,
} from "@/components/dashboard/ui/Table";

export default function ExperiencePage() {
  const route = dashboardRoutes.find((r) => r.href === "/dashboard/experience");

  const { user, hydrated } = useAuthStore();
  const profileId = user?.profileId;

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
        const [res1, res2] = await Promise.all([
          fetch(`/api/v1/profile/experience?profileId=${profileId}`),
          fetch(`/api/v1/profile/experienceSection?profileId=${profileId}`),
        ]);

        const json1 = await res1.json();
        const json2 = await res2.json();

        if (!isMounted) return;

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
    const res = await fetch(
      `/api/v1/profile/experience?profileId=${profileId}`,
    );
    const json = await res.json();
    setExperiences(json.data || []);
  };

  const handleSectionSubmit = async () => {
    if (
      sectionValidators.heading(sectionForm.heading) ||
      sectionValidators.subHeading(sectionForm.subHeading) ||
      sectionValidators.description(sectionForm.description)
    )
      return;

    const method = section ? "PATCH" : "POST";

    await fetch(`/api/v1/profile/experienceSection`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, ...sectionForm }),
    });

    const res = await fetch(
      `/api/v1/profile/experienceSection?profileId=${profileId}`,
    );
    const json = await res.json();

    setSection(json.data);
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

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsModalOpen(false);
    await refetch();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/v1/profile/experience?experienceId=${id}`, {
      method: "DELETE",
    });
    await refetch();
  };

  if (!hydrated) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader title={route.name} icon={route.icon} />
      <div className="border-t" />

      <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold">Experience Section</h2>
          <Button onClick={() => setIsSectionModalOpen(true)}>
            {section ? "Edit" : "Add"}
          </Button>
        </div>

        {section && (
          <div className="mt-3">
            <h3 className="font-semibold">{section.heading}</h3>
            <p className="text-sm text-gray-400">{section.subHeading}</p>
            <p className="mt-2">{section.description}</p>
          </div>
        )}
      </div>

      <div className="border rounded-lg bg-white dark:bg-gray-900">
        <div className="p-4 flex justify-between">
          <h2 className="text-lg font-semibold">Experiences</h2>
          <Button size="sm" onClick={openAdd}>
            ➕ Add Experience
          </Button>
        </div>

        <div className="p-4 border-t">
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
                <TableHeaderCell className="w-[120px] text-center">
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

      {isSectionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-[90%] max-w-lg space-y-3">
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
                setSectionForm({ ...sectionForm, subHeading: e.target.value })
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
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSectionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSectionSubmit}>
                {section ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-[90%] max-w-lg space-y-3">
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
              type="date"
              label="Start Date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              type="date"
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
              onChange={(e) =>
                setForm({ ...form, achievements: e.target.value })
              }
            />
            <Input
              label="Projects (comma separated)"
              value={form.projects}
              onChange={(e) => setForm({ ...form, projects: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingExp ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
