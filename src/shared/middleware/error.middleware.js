import { trackError } from "@/shared/lib/monitoring";
import logger from "@/shared/lib/logger";

const normalizeError = (err) => {
  return {
    message: err.message || "Internal Server Error",
    statusCode: err.statusCode || err.status || 500,
    code: err.code || "INTERNAL_ERROR",
    details: err.details || null,
  };
};

const buildResponse = (error) => {
  const isProd = process.env.NODE_ENV === "production";

  return {
    success: false,
    message: error.message,
    code: error.code,
    ...(isProd ? {} : { stack: error.stack }),
    ...(error.details ? { details: error.details } : {}),
  };
};

export const errorMiddleware = (err, req, res, next) => {
  const error = normalizeError(err);

  trackError(err, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  logger.error("HTTP_ERROR", {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    url: req.originalUrl,
    method: req.method,
  });

  return res.status(error.statusCode).json(buildResponse(err));
};
