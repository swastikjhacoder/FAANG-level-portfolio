import { trackError } from "@/shared/lib/monitoring";
import logger from "@/shared/lib/logger";

const DEFAULT_TIMEOUT = 5000;

export const withTimeout = (handler, timeoutMs = DEFAULT_TIMEOUT) => {
  return async (req, context = {}) => {
    const controller = new AbortController();
    const signal = controller.signal;

    let timeoutId;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();

          const error = new Error("Request timeout");
          error.statusCode = 408;

          reject(error);
        }, timeoutMs);
      });

      const handlerPromise = handler(req, {
        ...context,
        signal,
      });

      const response = await Promise.race([handlerPromise, timeoutPromise]);

      return response;
    } catch (error) {
      trackError(error, {
        url: req.url,
        method: req.method,
        type: "TIMEOUT",
      });

      logger.error("REQUEST_TIMEOUT", {
        message: error.message,
        url: req.url,
        method: req.method,
      });

      return new Response(
        JSON.stringify({
          success: false,
          message: error.statusCode === 408 ? "Request timeout" : error.message,
        }),
        {
          status: error.statusCode || 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } finally {
      clearTimeout(timeoutId);
    }
  };
};
