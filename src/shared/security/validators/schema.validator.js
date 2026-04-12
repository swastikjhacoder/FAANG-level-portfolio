import { ValidationError } from "./base.validator";

const formatErrors = (error) => {
  const formatted = {};

  if (error?.issues) {
    for (const issue of error.issues) {
      const field = issue.path?.join(".") || "unknown";
      formatted[field] = issue.message;
    }
    return formatted;
  }

  if (error?.inner && Array.isArray(error.inner)) {
    for (const err of error.inner) {
      if (!formatted[err.path]) {
        formatted[err.path] = err.message;
      }
    }
    return formatted;
  }

  return {
    error: error.message || "Validation error",
  };
};

export const validateSchema = (schema, data) => {
  try {
    if (typeof schema.safeParse === "function") {
      const result = schema.safeParse(data);

      if (!result.success) {
        throw new ValidationError(
          "Validation failed",
          formatErrors(result.error),
        );
      }

      return result.data;
    }

    if (typeof schema.validate === "function") {
      return schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
      });
    }

    if (typeof schema === "function") {
      const result = schema(data);

      if (!result.valid) {
        throw new ValidationError("Validation failed", result.errors);
      }

      return result.data || data;
    }

    throw new Error("Invalid schema provided");
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new ValidationError("Validation failed", formatErrors(error));
  }
};

export const withSchemaValidation = (handler, schema) => {
  return async (req, context = {}) => {
    try {
      const body = await req.json();

      const validatedData = await validateSchema(schema, body);

      return await handler(req, {
        ...context,
        body: validatedData,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message,
          details: error.details || null,
        }),
        { status: error.statusCode || 400 },
      );
    }
  };
};
