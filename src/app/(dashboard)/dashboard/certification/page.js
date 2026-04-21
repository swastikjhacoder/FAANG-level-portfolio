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

export default function CertificationPage() {
  const route = dashboardRoutes.find(
    (r) => r.href === "/dashboard/certification",
  );

  const { user, hydrated } = useAuthStore();
  const { profile } = useProfile();
  const [image, setImage] = useState(null);
  const profileId = profile?._id;
  const [loaded, setLoaded] = useState(false);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    heading: "",
    subHeading: "",
    description: "",
  });

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

  const [form, setForm] = useState({
    title: "",
    issuer: "",
    certificateFileUrl: "",
    issueDate: "",
  });

  const validators = {
    title: (v) => (!v ? "Required" : null),
    issuer: (v) => (!v ? "Required" : null),
  };

  const sectionValidators = {
    heading: (v) => (!v ? "Required" : null),
    subHeading: (v) => (!v ? "Required" : null),
    description: (v) => (!v || v.length < 10 ? "Min 10 chars" : null),
  };

  const isValidUrl = (url) => {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!hydrated || !profileId || loaded) return;

    setLoaded(true);

    (async () => {
      try {
        const [json1, json2] = await Promise.all([
          secureFetch(`/api/v1/profile/certification?profileId=${profileId}`),
          secureFetch(`/api/v1/profile/certificationSection`),
        ]);

        setCertifications(json1.data?.certifications || []);

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
  }, [hydrated, profileId, loaded]);

  const refetch = async () => {
    const json = await secureFetch(
      `/api/v1/profile/certification?profileId=${profileId}`,
    );
    setCertifications(json.data?.certifications || []);
  };

  const handleSectionSubmit = async () => {
    if (
      sectionValidators.heading(sectionForm.heading) ||
      sectionValidators.subHeading(sectionForm.subHeading) ||
      sectionValidators.description(sectionForm.description)
    )
      return;

    const method = "PUT";

    await secureFetch(`/api/v1/profile/certificationSection`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, ...sectionForm }),
    });

    const json = await secureFetch(
      `/api/v1/profile/certificationSection?profileId=${profileId}`,
    );

    setSection(json.data);
    setIsSectionModalOpen(false);
  };

  const openAdd = () => {
    setEditingCert(null);
    setImage(null);

    setForm({
      title: "",
      issuer: "",
      certificateFileUrl: "",
      issueDate: "",
    });

    setIsModalOpen(true);
  };

  const openEdit = (cert) => {
    setEditingCert(cert);

    setForm({
      title: cert.content?.certificationName || "",
      issuer: cert.content?.organization || "",
      certificateFileUrl: cert.content?.certificateFileUrl || "",
      issueDate: cert.content?.issueDate?.substring(0, 10) || "",
    });

    setImage(null);

    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (validators.title(form.title) || validators.issuer(form.issuer)) return;

    if (form.certificateFileUrl && !isValidUrl(form.certificateFileUrl)) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append(
        "data",
        JSON.stringify({
          profileId,
          content: {
            certificationName: form.title,
            organization: form.issuer,
            issueDate: form.issueDate,
            certificateFileUrl: form.certificateFileUrl,
          },
        }),
      );

      if (image) formData.append("image", image);

      const url = editingCert
        ? `/api/v1/profile/certification?certificationId=${editingCert._id}`
        : `/api/v1/profile/certification`;

      const method = editingCert ? "PATCH" : "POST";

      await secureFetch(url, {
        method,
        body: formData,
      });

      setIsModalOpen(false);
      setImage(null);

      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await secureFetch(`/api/v1/profile/certification?certificationId=${id}`, {
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
          <h2 className="text-lg font-semibold">Certification Section</h2>
          <Button onClick={() => setIsSectionModalOpen(true)}>
            {section ? "Edit" : "Add"}
          </Button>
        </div>

        {section && (
          <div className="mt-4 space-y-3">
            <div>
              <span className="text-xs text-[var(--text-muted)] uppercase">
                Heading
              </span>
              <h3 className="font-semibold">{section.heading}</h3>
            </div>

            <div>
              <span className="text-xs text-[var(--text-muted)] uppercase">
                Sub Heading
              </span>
              <p className="text-sm text-[var(--text-muted)]">
                {section.subHeading || "-"}
              </p>
            </div>

            <div>
              <span className="text-xs text-[var(--text-muted)] uppercase">
                Description
              </span>
              <p className="mt-1">{section.description || "-"}</p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-[var(--glass-bg)] border shadow-[var(--glass-shadow)]">
        <div className="p-4 flex justify-between">
          <h2 className="text-lg font-semibold">Certifications</h2>
          <Button size="sm" onClick={openAdd}>
            ➕ Add Certification
          </Button>
        </div>

        <div className="p-4 border-t">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell className="text-center">
                  Issuer
                </TableHeaderCell>
                <TableHeaderCell className="text-center">
                  Issue Year
                </TableHeaderCell>
                <TableHeaderCell className="text-center">
                  Action
                </TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {certifications.length === 0 && <TableEmpty colSpan={4} />}

              {certifications.map((cert) => (
                <TableRow key={cert._id}>
                  <TableCell>{cert.content?.certificationName}</TableCell>

                  <TableCell className="text-center">
                    {cert.content?.organization}
                  </TableCell>

                  <TableCell className="text-center">
                    {cert.content?.issueDate
                      ? new Date(cert.content.issueDate).getFullYear()
                      : "-"}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      {cert.content?.certificateImageUrl && (
                        <img
                          src={cert.content.certificateImageUrl}
                          alt="certificate"
                          onClick={() =>
                            window.open(
                              cert.content.certificateImageUrl,
                              "_blank",
                            )
                          }
                          className="w-12 h-12 object-cover rounded cursor-pointer hover:scale-105 transition"
                        />
                      )}

                      <div className="flex flex-col text-sm">
                        <span className="font-medium">
                          {cert.content?.certificationName}
                        </span>

                        <span className="text-[var(--text-muted)]">
                          {cert.content?.organization}
                        </span>

                        <span className="text-xs text-[var(--text-muted)]">
                          {cert.content?.issueDate
                            ? new Date(
                                cert.content.issueDate,
                              ).toLocaleDateString()
                            : "-"}
                        </span>

                        {cert.content?.certificateFileUrl && (
                          <a
                            href={cert.content.certificateFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 text-xs underline mt-1"
                          >
                            View Certificate
                          </a>
                        )}
                      </div>
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
        title={
          section ? "Edit Certification Section" : "Add Certification Section"
        }
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
        title={editingCert ? "Edit Certification" : "Add Certification"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : editingCert ? "Update" : "Add"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Issuer"
            value={form.issuer}
            onChange={(e) => setForm({ ...form, issuer: e.target.value })}
          />
          <Input
            type="date"
            label="Issue Date"
            value={form.issueDate}
            onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
          />
          <Input
            label="Certificate File URL"
            value={form.certificateFileUrl}
            onChange={(e) =>
              setForm({ ...form, certificateFileUrl: e.target.value })
            }
          />

          <Input
            type="file"
            label="Certificate Image"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </div>
      </Modal>
    </div>
  );
}
