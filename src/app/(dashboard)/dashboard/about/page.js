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
import { secureFetch } from "@/shared/lib/secureFetch";

export default function AboutPage() {
  const route = dashboardRoutes.find((r) => r.href === "/dashboard/about");

  const { user, hydrated } = useAuthStore();
  const profileId = user?.id;
  console.log("USER:", user);

  console.log("PROFILE ID:", profileId);

  const [about, setAbout] = useState(null);
  const [aboutForm, setAboutForm] = useState({
    heading: "",
    subHeading: "",
    description: "",
  });

  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const [modalEditing, setModalEditing] = useState(null);

  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const summaryValidators = {
    item: (value) => {
      if (!value || !value.trim()) return "Item is required";
      if (value.trim().length < 3) return "Minimum 3 characters required";
      if (value.length > 500) return "Maximum 120 characters allowed";
      return null;
    },
  };

  const aboutValidators = {
    heading: (value) => {
      if (!value || !value.trim()) return "Heading is required";
      if (value.length < 3) return "Minimum 3 characters required";
      return null;
    },
    subHeading: (value) => {
      if (!value || !value.trim()) return "Sub heading is required";
      return null;
    },
    description: (value) => {
      if (!value || !value.trim()) return "Description is required";
      if (value.length < 10) return "Minimum 10 characters required";
      return null;
    },
  };

  useEffect(() => {
    if (!hydrated || !profileId) return;

    let isMounted = true;

    (async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`/api/v1/profile/profileSummary?profileId=${profileId}`),
          fetch(`/api/v1/profile/aboutSection?profileId=${profileId}`),
        ]);

        const json1 = await res1.json();
        const json2 = await res2.json();

        if (!isMounted) return;

        if (res1.ok) setData(json1.data || []);

        if (res2.ok && json2.data) {
          setAbout(json2.data);
          setAboutForm({
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

  const handleAboutChange = (e) => {
    setAboutForm({
      ...aboutForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAboutModalSubmit = async () => {
    const errors = {
      heading: aboutValidators.heading(aboutForm.heading),
      subHeading: aboutValidators.subHeading(aboutForm.subHeading),
      description: aboutValidators.description(aboutForm.description),
    };

    if (errors.heading || errors.subHeading || errors.description) return;

    const method = about ? "PATCH" : "POST";

    await fetch(`/api/v1/profile/aboutSection`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId,
        ...aboutForm,
      }),
    });

    const res = await fetch(
      `/api/v1/profile/aboutSection?profileId=${profileId}`,
    );
    const json = await res.json();

    setAbout(json.data);
    setIsAboutModalOpen(false);
  };

  const refreshSummary = async () => {
    const res = await fetch(
      `/api/v1/profile/profileSummary?profileId=${profileId}`,
    );
    const json = await res.json();
    setData(json.data || []);
  };

  const openAddModal = () => {
    setModalEditing(null);
    setModalInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (summaryId, item, index) => {
    setModalEditing({ summaryId, index });
    setModalInput(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalInput("");
    setModalEditing(null);
  };

  const handleModalSubmit = async () => {
    const error = summaryValidators.item(modalInput);
    if (error) return;

    if (modalEditing) {
      const summary = data.find((d) => d._id === modalEditing.summaryId);
      const updatedItems = [...summary.items];
      updatedItems[modalEditing.index] = modalInput;

      await secureFetch(
        `/api/v1/profile/profileSummary?profileSummaryId=${modalEditing.summaryId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ items: updatedItems }),
        },
      );
    } else {
      await secureFetch(`/api/v1/profile/profileSummary`, {
        method: "POST",
        body: JSON.stringify({
          items: [modalInput],
        }),
      });
    }

    closeModal();
    refreshSummary();
  };

  const handleDelete = async (summaryId) => {
    await secureFetch(
      `/api/v1/profile/profileSummary?profileSummaryId=${summaryId}`,

      {
        method: "DELETE",
      },
    );
    refreshSummary();
  };

  if (!hydrated) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader title={route.name} icon={route.icon} />

      <div className="border-t border-[var(--glass-border)]" />

      <div className="rounded-xl p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--text-color)]">
            About Section
          </h2>

          <Button onClick={() => setIsAboutModalOpen(true)}>
            {about ? "Edit" : "Add"}
          </Button>
        </div>

        {about && (
          <div className="mt-4 space-y-1">
            <h3 className="font-semibold">{about.heading}</h3>
            <p className="text-sm text-[var(--text-muted)]">
              {about.subHeading}
            </p>
            <p className="mt-2">{about.description}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
        <div
          className="p-4 flex justify-between items-center cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <h2 className="text-lg font-semibold">Profile Summary Items</h2>

          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openAddModal();
            }}
          >
            ➕
          </Button>
        </div>

        {expanded && (
          <div className="p-4 border-t border-[var(--glass-border)]">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="w-full">Item</TableHeaderCell>
                  <TableHeaderCell className="text-center w-30">
                    Action
                  </TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data.length === 0 && <TableEmpty colSpan={2} />}

                {data.flatMap((summary) =>
                  summary.items.map((item, index) => (
                    <TableRow key={`${summary._id}-${index}`}>
                      <TableCell className="wrap-break-word">{item}</TableCell>

                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              openEditModal(summary._id, item, index)
                            }
                          >
                            ✏️
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(summary._id)}
                          >
                            🗑️
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalEditing ? "Edit Item" : "Add Item"}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>

            <Button
              onClick={handleModalSubmit}
              disabled={!hydrated || !!summaryValidators.item(modalInput)}
            >
              {modalEditing ? "Update" : "Add"}
            </Button>
          </>
        }
      >
        <Input
          label="Item"
          value={modalInput}
          onChange={(e) => setModalInput(e.target.value)}
          validate={summaryValidators.item}
        />
      </Modal>

      <Modal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        title={about ? "Edit About Section" : "Add About Section"}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsAboutModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAboutModalSubmit}
              disabled={
                !!aboutValidators.heading(aboutForm.heading) ||
                !!aboutValidators.subHeading(aboutForm.subHeading) ||
                !!aboutValidators.description(aboutForm.description)
              }
            >
              {about ? "Update" : "Add"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Heading"
            name="heading"
            value={aboutForm.heading}
            onChange={handleAboutChange}
            validate={aboutValidators.heading}
          />

          <Input
            label="Sub Heading"
            name="subHeading"
            value={aboutForm.subHeading}
            onChange={handleAboutChange}
            validate={aboutValidators.subHeading}
          />

          <Input
            label="Description"
            name="description"
            textarea
            value={aboutForm.description}
            onChange={handleAboutChange}
            validate={aboutValidators.description}
          />
        </div>
      </Modal>
    </div>
  );
}
