import { trackError } from "@/shared/lib/monitoring";
import logger from "@/shared/lib/logger";
import { AppError } from "@/shared/errors/AppError.js";

const normalizeError = (err) => {
  if (err instanceof AppError) {
    return {
      message: err.message,
      statusCode: err.status,
      code: err.code,
      details: err.meta || null,
      stack: err.stack,
    };
  }

  return {
    message: "Internal Server Error",
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    details: null,
    stack: err.stack,
  };
};

const buildResponse = (error) => {
  const isProd = process.env.NODE_ENV === "production";

  return {
    success: false,
    message: error.message,
    code: error.code,

    ...(isProd ? {} : { stack: error.stack }),

    ...(error.details && !isProd ? { details: error.details } : {}),
  };
};

export const errorMiddleware = (err, req, res, next) => {
  const error = normalizeError(err);

  trackError(err, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  });

  logger.error("HTTP_ERROR", {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
  });

  return res.status(error.statusCode).json(buildResponse(error));
};
