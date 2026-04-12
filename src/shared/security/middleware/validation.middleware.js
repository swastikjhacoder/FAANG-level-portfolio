import { handleApiError } from "@/shared/utils/errorHandler";

const validateWithDTO = async (req, DTO) => {
  const body = await req.json();

  const dtoInstance = new DTO(body);

  return dtoInstance;
};

const validateWithSchema = async (req, schema) => {
  const body = await req.json();

  const result = schema.safeParse
    ? schema.safeParse(body)
    : schema.validate(body);

  if (result.success === false) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = result.error?.errors || result.error;

    throw error;
  }

  return result.data || body;
};

export const withValidation = (handler, { dto = null, schema = null } = {}) => {
  return async (req, context = {}) => {
    try {
      let validatedData;

      if (dto) {
        validatedData = await validateWithDTO(req, dto);
      }

      if (schema) {
        validatedData = await validateWithSchema(req, schema);
      }

      return await handler(req, {
        ...context,
        body: validatedData,
      });
    } catch (error) {
      return handleApiError(error, req);
    }
  };
};
