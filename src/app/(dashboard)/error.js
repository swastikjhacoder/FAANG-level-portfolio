"use client";
import logger from "@/shared/lib/logger";
import { useEffect } from "react";

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    logger.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-75 text-center">
      <h2 className="text-xl font-semibold text-red-500">
        Something went wrong in Dashboard
      </h2>

      <p className="mt-2 text-gray-500 text-sm">
        {error?.message || "Unexpected error occurred"}
      </p>

      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-black text-white rounded-md"
      >
        Try Again
      </button>
    </div>
  );
}
