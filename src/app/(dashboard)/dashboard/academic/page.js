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

export default function AcademicPage() {
  const route = dashboardRoutes.find((r) => r.href === "/dashboard/academic");

  const { user, hydrated } = useAuthStore();
  const profileId = user?.profileId;

  const [educations, setEducations] = useState([]);

  const [section, setSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    heading: "",
    subHeading: "",
    description: "",
  });

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);

  const [form, setForm] = useState({
    institution: "",
    boardOrUniversity: "",
    degree: "",
    specializations: "",
    startDate: "",
    endDate: "",
  });

  const validators = {
    institution: (v) => (!v ? "Required" : null),
    degree: (v) => (!v ? "Required" : null),
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
          fetch(`/api/v1/profile/education?profileId=${profileId}`),
          fetch(`/api/v1/profile/academicSection?profileId=${profileId}`),
        ]);

        const json1 = await res1.json();
        const json2 = await res2.json();

        if (!isMounted) return;

        setEducations(json1.data || []);

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
    const res = await fetch(`/api/v1/profile/education?profileId=${profileId}`);
    const json = await res.json();
    setEducations(json.data || []);
  };

  const handleSectionSubmit = async () => {
    if (
      sectionValidators.heading(sectionForm.heading) ||
      sectionValidators.subHeading(sectionForm.subHeading) ||
      sectionValidators.description(sectionForm.description)
    )
      return;

    const method = section ? "PATCH" : "POST";

    await fetch(`/api/v1/profile/academicSection`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, ...sectionForm }),
    });

    const res = await fetch(
      `/api/v1/profile/academicSection?profileId=${profileId}`,
    );
    const json = await res.json();

    setSection(json.data);
    setIsSectionModalOpen(false);
  };

  const openAdd = () => {
    setEditingEdu(null);
    setForm({
      institution: "",
      boardOrUniversity: "",
      degree: "",
      specializations: "",
      startDate: "",
      endDate: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (edu) => {
    setEditingEdu(edu);
    setForm({
      institution: edu.institution,
      boardOrUniversity: edu.boardOrUniversity || "",
      degree: edu.degree || "",
      specializations: edu.specializations?.join(", "),
      startDate: edu.startDate?.substring(0, 10) || "",
      endDate: edu.endDate?.substring(0, 10) || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (
      validators.institution(form.institution) ||
      validators.degree(form.degree)
    )
      return;

    const payload = {
      profileId,
      institution: form.institution,
      boardOrUniversity: form.boardOrUniversity,
      degree: form.degree,
      specializations: form.specializations.split(",").map((i) => i.trim()),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };

    const url = editingEdu
      ? `/api/v1/profile/education?educationId=${editingEdu._id}`
      : `/api/v1/profile/education`;

    const method = editingEdu ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsModalOpen(false);
    await refetch();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/v1/profile/education?educationId=${id}`, {
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
          <h2 className="text-lg font-semibold">Academic Section</h2>
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
          <h2 className="text-lg font-semibold">Education</h2>
          <Button size="sm" onClick={openAdd}>
            ➕ Add Education
          </Button>
        </div>

        <div className="p-4 border-t">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-[33%]">
                  Institution
                </TableHeaderCell>
                <TableHeaderCell className="w-[33%] text-center">
                  Degree
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
              {educations.length === 0 && <TableEmpty colSpan={4} />}

              {educations.map((edu) => (
                <TableRow key={edu._id}>
                  <TableCell>{edu.institution}</TableCell>
                  <TableCell className="text-center">{edu.degree}</TableCell>
                  <TableCell className="text-center">
                    {edu.startDate
                      ? new Date(edu.startDate).getFullYear()
                      : "-"}{" "}
                    -{" "}
                    {edu.endDate
                      ? new Date(edu.endDate).getFullYear()
                      : "Present"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(edu)}
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(edu._id)}
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
              label="Institution"
              value={form.institution}
              onChange={(e) =>
                setForm({ ...form, institution: e.target.value })
              }
            />
            <Input
              label="Board / University"
              value={form.boardOrUniversity}
              onChange={(e) =>
                setForm({ ...form, boardOrUniversity: e.target.value })
              }
            />
            <Input
              label="Degree"
              value={form.degree}
              onChange={(e) => setForm({ ...form, degree: e.target.value })}
            />
            <Input
              label="Specializations (comma separated)"
              value={form.specializations}
              onChange={(e) =>
                setForm({ ...form, specializations: e.target.value })
              }
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

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingEdu ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
