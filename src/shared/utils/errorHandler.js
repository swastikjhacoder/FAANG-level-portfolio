import { trackError } from "@/shared/lib/monitoring";
import logger from "@/shared/lib/logger";

export const handleApiError = (error, req) => {
  const statusCode = error.statusCode || 500;

  trackError(error, {
    url: req.url,
    method: req.method,
  });

  logger.error("API_ERROR", {
    message: error.message,
    statusCode,
    url: req.url,
  });

  return new Response(
    JSON.stringify({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Something went wrong"
          : error.message,
    }),
    {
      status: statusCode,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};
