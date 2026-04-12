import os from "os";
import process from "process";
import logger from "./logger";

let startTime = Date.now();

export const getSystemMetrics = () => {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpuLoad: os.loadavg(),
    platform: process.platform,
    nodeVersion: process.version,
  };
};

export const trackRequest = ({
  requestId,
  method,
  url,
  statusCode,
  duration,
  userId,
  ip,
}) => {
  logger.info("HTTP_REQUEST", {
    requestId,
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    userId,
    ip,
  });
};

export const trackError = (error, context = {}) => {
  logger.error("APPLICATION_ERROR", {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

export const trackSecurityEvent = ({
  type,
  userId,
  ip,
  userAgent,
  metadata = {},
}) => {
  logger.warn("SECURITY_EVENT", {
    type,
    userId,
    ip,
    userAgent,
    metadata,
  });
};

export const measureExecution = async (label, fn) => {
  const start = Date.now();

  try {
    const result = await fn();

    const duration = Date.now() - start;

    logger.info("PERFORMANCE", {
      label,
      duration: `${duration}ms`,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - start;

    logger.error("PERFORMANCE_ERROR", {
      label,
      duration: `${duration}ms`,
      error: error.message,
    });

    throw error;
  }
};

export const healthCheck = () => {
  return {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage().rss,
  };
};

export const registerGlobalHandlers = () => {
  process.on("uncaughtException", (err) => {
    logger.error("UNCAUGHT_EXCEPTION", {
      message: err.message,
      stack: err.stack,
    });

    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("UNHANDLED_REJECTION", {
      reason,
    });
  });
};

export const initMonitoring = () => {
  logger.info("MONITORING_STARTED", {
    startedAt: new Date(startTime).toISOString(),
    env: process.env.NODE_ENV,
  });

  registerGlobalHandlers();
};
