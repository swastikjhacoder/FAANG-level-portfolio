import logger from "@/shared/lib/logger";

export const handleError = (err) => {
  logger.error("App error", {
    message: err.message,
    code: err.code,
  });

  return {
    message: "Internal Server Error",
    code: err.code || "INTERNAL_ERROR",
  };
};
