import { trackError } from "@/shared/lib/monitoring";
import logger from "@/shared/lib/logger";

export const handleApiError = (error, req = null) => {
  const statusCode = error.status || 500;

  console.error("APPLICATION_ERROR:", {
    message: error.message,
    statusCode,
    url: req?.url || "unknown",
    method: req?.method || "unknown",
    stack: error.stack,
  });

  return new Response(
    JSON.stringify({
      success: false,
      message:
        error.code === "BAD_USER_INPUT"
          ? error.message
          : "Internal Server Error",
      code: error.code || "INTERNAL_ERROR",
    }),
    {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    },
  );
};