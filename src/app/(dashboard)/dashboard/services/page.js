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
import Image from "next/image";

export default function ServicesPage() {
  const route = dashboardRoutes.find((r) => r.href === "/dashboard/services");

  const { user, hydrated } = useAuthStore();
  const profileId = user?.profileId;

  const [services, setServices] = useState([]);

  const [section, setSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    heading: "",
    subHeading: "",
    description: "",
  });

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [form, setForm] = useState({
    heading: "",
    subheading: "",
    description: "",
    icon: null,
  });

  const validators = {
    heading: (v) => (!v ? "Required" : null),
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
          fetch(`/api/v1/profile/service?profileId=${profileId}`),
          fetch(`/api/v1/profile/serviceSection?profileId=${profileId}`),
        ]);

        const json1 = await res1.json();
        const json2 = await res2.json();

        if (!isMounted) return;

        setServices(json1.data || []);

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
    const res = await fetch(`/api/v1/profile/service?profileId=${profileId}`);
    const json = await res.json();
    setServices(json.data || []);
  };

  const handleSectionSubmit = async () => {
    if (
      sectionValidators.heading(sectionForm.heading) ||
      sectionValidators.subHeading(sectionForm.subHeading) ||
      sectionValidators.description(sectionForm.description)
    )
      return;

    const method = section ? "PATCH" : "POST";

    await fetch(`/api/v1/profile/serviceSection`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, ...sectionForm }),
    });

    const res = await fetch(
      `/api/v1/profile/serviceSection?profileId=${profileId}`,
    );
    const json = await res.json();

    setSection(json.data);
    setIsSectionModalOpen(false);
  };

  const openAdd = () => {
    setEditingService(null);
    setForm({
      heading: "",
      subheading: "",
      description: "",
      icon: null,
    });
    setIsModalOpen(true);
  };

  const openEdit = (s) => {
    setEditingService(s);
    setForm({
      heading: s.heading,
      subheading: s.subheading || "",
      description: s.description || "",
      icon: null,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (validators.heading(form.heading)) return;

    const formData = new FormData();

    formData.append("profileId", profileId);
    formData.append("heading", form.heading);
    formData.append("subheading", form.subheading);
    formData.append("description", form.description);

    if (form.icon) formData.append("icon", form.icon);

    const url = editingService
      ? `/api/v1/profile/service?serviceId=${editingService._id}`
      : `/api/v1/profile/service`;

    const method = editingService ? "PATCH" : "POST";

    await fetch(url, { method, body: formData });

    setIsModalOpen(false);
    await refetch();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/v1/profile/service?serviceId=${id}`, {
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
          <h2 className="text-lg font-semibold">Services Section</h2>
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
          <h2 className="text-lg font-semibold">Services</h2>
          <Button size="sm" onClick={openAdd}>
            ➕ Add Service
          </Button>
        </div>

        <div className="p-4 border-t">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-[40%]">Service</TableHeaderCell>
                <TableHeaderCell className="w-[40%] text-center">
                  Description
                </TableHeaderCell>
                <TableHeaderCell className="w-[120px] text-center">
                  Action
                </TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {services.length === 0 && <TableEmpty colSpan={3} />}

              {services.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="flex items-center gap-3">
                    {s.icon?.url && (
                      <div className="relative w-8 h-8">
                        <Image
                          src={s.icon.url}
                          alt={s.heading}
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </div>
                    )}
                    {s.heading}
                  </TableCell>

                  <TableCell className="text-center text-sm">
                    {s.subheading}
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(s)}
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(s._id)}
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
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsSectionModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSectionSubmit}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-[90%] max-w-lg space-y-3">
            <Input
              label="Heading"
              value={form.heading}
              onChange={(e) => setForm({ ...form, heading: e.target.value })}
            />
            <Input
              label="Subheading"
              value={form.subheading}
              onChange={(e) => setForm({ ...form, subheading: e.target.value })}
            />
            <Input
              label="Description"
              textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
              type="file"
              onChange={(e) => setForm({ ...form, icon: e.target.files[0] })}
              className="text-white text-sm"
            />

            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingService ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
