import { randomUUID } from "crypto";

export const REQUEST_ID_HEADER = "x-request-id";

export const generateRequestId = () => {
  return randomUUID();
};

export const getRequestId = (req) => {
  const existing =
    req.headers.get(REQUEST_ID_HEADER) ||
    req.headers.get(REQUEST_ID_HEADER.toUpperCase());

  return existing || generateRequestId();
};

export const withRequestId = (handler) => {
  return async (req, context) => {
    const requestId = getRequestId(req);

    try {
      const response = await handler(req, {
        ...context,
        requestId,
      });

      if (response instanceof Response) {
        response.headers.set(REQUEST_ID_HEADER, requestId);
      }

      return response;
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message,
          requestId,
        }),
        {
          status: error.statusCode || 500,
          headers: {
            "Content-Type": "application/json",
            [REQUEST_ID_HEADER]: requestId,
          },
        },
      );
    }
  };
};
