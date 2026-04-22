"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { secureFetch } from "@/shared/lib/secureFetch";

export default function TestimonialPage() {
  const { profile, hydrated } = useAuthStore();
  const profileId = profile?._id;

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchTestimonials = async () => {
    try {
      if (!profileId) return;

      setLoading(true);

      const data = await secureFetch(
        `/api/v1/profile/testimonial?profileId=${profileId.toString()}&admin=true`,
      );

      if (data?.success) {
        setTestimonials(data.data || []);
      } else {
        console.error("API Error:", data?.message);
        setTestimonials([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hydrated || !profileId) return;

    fetchTestimonials();
  }, [hydrated, profileId]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);

      const data = await secureFetch(
        `/api/v1/profile/testimonial?testimonialId=${id}`,
        { method: "PATCH" },
      );

      if (data.success) {
        setTestimonials((prev) =>
          prev.map((t) => (t._id === id ? { ...t, approved: true } : t)),
        );
      }
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(id);

      const data = await secureFetch(
        `/api/v1/profile/testimonial?testimonialId=${id}`,
        { method: "DELETE" },
      );

      if (data.success) {
        setTestimonials((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Testimonials</h1>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : testimonials.length === 0 ? (
        <p className="text-sm text-gray-500">No testimonials found</p>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <div
              key={t._id}
              className="border rounded-xl p-4 shadow-sm flex gap-4"
            >
              {/* Image */}
              {t.senderImage?.url ? (
                <img
                  src={t.senderImage.url}
                  alt={t.senderName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                  {t.senderName?.charAt(0)}
                </div>
              )}

              <div className="flex-1">
                <p className="text-sm italic text-gray-700">“{t.quote}”</p>

                <div className="mt-3 text-sm text-gray-600">
                  <p className="font-medium">{t.senderName}</p>
                  <p>
                    {t.senderRole}
                    {t.company && ` @ ${t.company}`}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      t.approved
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {t.approved ? "Approved" : "Pending"}
                  </span>

                  <div className="flex gap-2">
                    {!t.approved && (
                      <button
                        onClick={() => handleApprove(t._id)}
                        disabled={actionLoading === t._id}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
                      >
                        {actionLoading === t._id ? "Approving..." : "Approve"}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(t._id)}
                      disabled={actionLoading === t._id}
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                    >
                      {actionLoading === t._id ? "Processing..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
