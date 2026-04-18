"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { dashboardRoutes } from "@/config/dashboardRoutes";
import { useAuthStore } from "@/store/useAuthStore";

export default function AboutPage() {
  const route = dashboardRoutes.find((r) => r.href === "/dashboard/about");

  const { user, hydrated } = useAuthStore();
  const profileId = user?.profileId;

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
    if (!modalInput.trim()) return;

    if (modalEditing) {
      const summary = data.find((d) => d._id === modalEditing.summaryId);

      const updatedItems = [...summary.items];
      updatedItems[modalEditing.index] = modalInput;

      await fetch(
        `/api/v1/profile/profileSummary?profileSummaryId=${modalEditing.summaryId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: updatedItems }),
        },
      );
    } else {
      await fetch(`/api/v1/profile/profileSummary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          items: [modalInput],
        }),
      });
    }

    closeModal();
    refreshSummary();
  };

  const handleDelete = async (summaryId) => {
    await fetch(
      `/api/v1/profile/profileSummary?profileSummaryId=${summaryId}`,
      {
        method: "DELETE",
      },
    );

    refreshSummary();
  };

  if (!hydrated) return null;

  return (
    <div className="p-6">
      <PageHeader title={route.name} icon={route.icon} />
      <div className="border-t mb-6" />

      <div className="mb-6 border rounded-lg p-4 bg-white dark:bg-gray-900">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">About Section</h2>

          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {about ? "Edit" : "Add"}
          </button>
        </div>

        {about && (
          <div className="mt-4">
            <h3 className="font-semibold">{about.heading}</h3>
            <p className="text-sm text-gray-500">{about.subHeading}</p>
            <p className="mt-2">{about.description}</p>
          </div>
        )}
      </div>

      <div className="border rounded-lg bg-white dark:bg-gray-900">
        <div
          className="p-4 flex justify-between items-center cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <h2 className="text-lg font-semibold">Profile Summary Items</h2>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openAddModal();
              }}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              ➕ Add
            </button>

            <span>{expanded ? "▲" : "▼"}</span>
          </div>
        </div>

        {expanded && (
          <div className="p-4 border-t">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="p-2 border">Item</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>

              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan="2" className="text-center p-4">
                      No data found
                    </td>
                  </tr>
                )}

                {data.flatMap((summary) =>
                  summary.items.map((item, index) => (
                    <tr key={`${summary._id}-${index}`}>
                      <td className="p-2 border">{item}</td>

                      <td className="p-2 border flex gap-3 justify-center">
                        <button
                          onClick={() =>
                            openEditModal(summary._id, item, index)
                          }
                          className="text-blue-600"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => handleDelete(summary._id)}
                          className="text-red-600"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {modalEditing ? "Edit Item" : "Add Item"}
            </h2>

            <input
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              placeholder="Enter item"
              className="border p-2 w-full rounded mb-4"
            />

            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 border rounded">
                Cancel
              </button>

              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {modalEditing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAboutModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">
              {about ? "Edit About Section" : "Add About Section"}
            </h2>

            <div className="space-y-3">
              <input
                name="heading"
                value={aboutForm.heading}
                onChange={handleAboutChange}
                placeholder="Heading"
                className="border p-2 w-full rounded"
              />

              <input
                name="subHeading"
                value={aboutForm.subHeading}
                onChange={handleAboutChange}
                placeholder="Sub Heading"
                className="border p-2 w-full rounded"
              />

              <textarea
                name="description"
                value={aboutForm.description}
                onChange={handleAboutChange}
                placeholder="Description"
                rows={4}
                className="border p-2 w-full rounded"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsAboutModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAboutModalSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {about ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
