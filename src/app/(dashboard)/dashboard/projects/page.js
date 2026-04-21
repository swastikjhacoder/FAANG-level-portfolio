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
import { useProfile } from "@/modules/profile/hooks/useProfile";
import { secureFetch } from "@/shared/lib/secureFetch";

export default function ProjectsPage() {
  const route = dashboardRoutes.find((r) => r.href === "/dashboard/projects");

  const { user, hydrated } = useAuthStore();
  const { profile, loading: profileLoading } = useProfile();

  const profileId = profile?._id;

  const [projects, setProjects] = useState([]);

  const [section, setSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    heading: "",
    subHeading: "",
    description: "",
  });

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [form, setForm] = useState({
    name: "",
    liveUrl: "",
    githubUrl: "",
    techStack: "",
    description: "",
    screenshot: null,
  });

  const validators = {
    name: (v) => (!v ? "Required" : null),
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
          secureFetch(`/api/v1/profile/project?profileId=${profileId}`),
          secureFetch(`/api/v1/profile/projectSection?profileId=${profileId}`),
        ]);

        if (!isMounted) return;

        setProjects(json1.data || []);

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
    const json = await secureFetch(
      `/api/v1/profile/project?profileId=${profileId}`,
    );
    setProjects(json.data || []);
  };

  const handleSectionSubmit = async () => {
    if (
      sectionValidators.heading(sectionForm.heading) ||
      sectionValidators.subHeading(sectionForm.subHeading) ||
      sectionValidators.description(sectionForm.description)
    )
      return;

    const method = section?._id ? "PATCH" : "POST";

    await secureFetch(`/api/v1/profile/projectSection`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, ...sectionForm }),
    });

    const json = await secureFetch(
      `/api/v1/profile/projectSection?profileId=${profileId}`,
    );

    setSection(json.data);
    setIsSectionModalOpen(false);
  };

  const openAdd = () => {
    setEditingProject(null);
    setForm({
      name: "",
      liveUrl: "",
      githubUrl: "",
      techStack: "",
      description: "",
      screenshot: null,
    });
    setIsModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingProject(p);
    setForm({
      name: p.name,
      liveUrl: p.liveUrl || "",
      githubUrl: p.githubUrl || "",
      techStack: JSON.stringify(p.techStack || []),
      description: (p.description || []).join(", "),
      screenshot: null,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (validators.name(form.name)) return;

    const formData = new FormData();

    formData.append("profileId", profileId);
    formData.append("name", form.name);
    formData.append("liveUrl", form.liveUrl);
    formData.append("githubUrl", form.githubUrl);

    formData.append(
      "techStack",
      JSON.stringify(
        form.techStack
          ? form.techStack.split(",").map((t) => ({ name: t.trim() }))
          : [],
      ),
    );

    formData.append(
      "description",
      JSON.stringify(form.description.split(",").map((d) => d.trim())),
    );

    if (form.screenshot) formData.append("screenshot", form.screenshot);

    const url = editingProject
      ? `/api/v1/profile/project?projectId=${editingProject._id}`
      : `/api/v1/profile/project`;

    const method = editingProject ? "PATCH" : "POST";

    await secureFetch(url, { method, body: formData });

    setIsModalOpen(false);
    await refetch();
  };

  const handleDelete = async (id) => {
    await secureFetch(`/api/v1/profile/project?projectId=${id}`, {
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
            Projects Section
          </h2>
          <Button onClick={() => setIsSectionModalOpen(true)}>
            {section ? "Edit" : "Add"}
          </Button>
        </div>

        {(section || sectionForm) && (
          <div className="mt-4 space-y-3">
            <div>
              <span className="text-xs text-[var(--text-muted)] uppercase">
                Heading
              </span>
              <h3 className="font-semibold">
                {section?.heading || sectionForm.heading || "-"}
              </h3>
            </div>

            <div>
              <span className="text-xs text-[var(--text-muted)] uppercase">
                Sub Heading
              </span>
              <p className="text-sm text-[var(--text-muted)]">
                {section?.subHeading || sectionForm.subHeading || "-"}
              </p>
            </div>

            <div>
              <span className="text-xs text-[var(--text-muted)] uppercase">
                Description
              </span>
              <p className="mt-1">
                {section?.description || sectionForm.description || "-"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
        <div className="p-4 flex justify-between">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Button size="sm" onClick={openAdd}>
            ➕ Add Project
          </Button>
        </div>

        <div className="p-4 border-t border-[var(--glass-border)]">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-[40%]">Project</TableHeaderCell>
                <TableHeaderCell className="w-[30%] text-center">
                  Links
                </TableHeaderCell>
                <TableHeaderCell className="w-[30%] text-center">
                  Tech
                </TableHeaderCell>
                <TableHeaderCell className="w-30 text-center">
                  Action
                </TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {projects.length === 0 && <TableEmpty colSpan={4} />}

              {projects.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="flex items-center gap-3">
                    {p.screenshot?.url && (
                      <div className="relative w-10 h-10">
                        <Image
                          src={p.screenshot.url}
                          alt={p.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    {p.name}
                  </TableCell>

                  <TableCell className="text-center text-xs">
                    {p.liveUrl && <div>🌐 Live</div>}
                    {p.githubUrl && <div>💻 GitHub</div>}
                  </TableCell>

                  <TableCell className="text-center text-xs">
                    {p.techStack?.map((t) => t.name).join(", ")}
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(p)}
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(p._id)}
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
        title={section ? "Edit Projects Section" : "Add Projects Section"}
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
        title={editingProject ? "Edit Project" : "Add Project"}
        footer={
          <>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {editingProject ? "Update" : "Add"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Project Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Live URL"
            value={form.liveUrl}
            onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
          />
          <Input
            label="GitHub URL"
            value={form.githubUrl}
            onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
          />
          <Input
            label="Tech Stack (comma separated)"
            value={form.techStack}
            onChange={(e) => setForm({ ...form, techStack: e.target.value })}
          />
          <Input
            label="Description (comma separated)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            type="file"
            onChange={(e) =>
              setForm({ ...form, screenshot: e.target.files[0] })
            }
            className="text-[var(--text-color)] text-sm"
          />
        </div>
      </Modal>
    </div>
  );
}
