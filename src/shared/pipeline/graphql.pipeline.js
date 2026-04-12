import { withRequestId } from "@/shared/middleware/requestId.middleware";
import { withTimeout } from "@/shared/middleware/timeout.middleware";
import { handleApiError } from "@/shared/utils/errorHandler";
import { trackRequest } from "@/shared/lib/monitoring";

export const createGraphQLPipeline = (handler, options = {}) => {
  const { timeout = 5000, enableLogging = true } = options;

  return withRequestId(
    withTimeout(async (req, context = {}) => {
      const start = Date.now();

      try {
        const response = await handler(req, context);

        if (enableLogging) {
          trackRequest({
            requestId: context.requestId,
            method: req.method,
            url: req.url,
            statusCode: 200,
            duration: Date.now() - start,
          });
        }

        return response;
      } catch (error) {
        if (enableLogging) {
          trackRequest({
            requestId: context.requestId,
            method: req.method,
            url: req.url,
            statusCode: error.statusCode || 500,
            duration: Date.now() - start,
          });
        }

        return handleApiError(error, req);
      }
    }, timeout),
  );
};
