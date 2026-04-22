import { z } from "zod";

const sanitize = (str) => str.replace(/[<>]/g, "");

export const upsertContactSectionSchema = z
  .object({
    heading: z
      .string({
        required_error: "Heading is required",
        invalid_type_error: "Heading must be a string",
      })
      .trim()
      .min(1, "Heading cannot be empty")
      .max(120, "Heading too long")
      .transform(sanitize),

    subHeading: z
      .string({
        invalid_type_error: "SubHeading must be a string",
      })
      .trim()
      .max(200, "SubHeading too long")
      .optional()
      .default("")
      .transform(sanitize),

    description: z
      .string({
        invalid_type_error: "Description must be a string",
      })
      .trim()
      .max(1000, "Description too long")
      .optional()
      .default("")
      .transform(sanitize),
  })
  .strict();

export const upsertContactSectionDTO = (data) => {
  return upsertContactSectionSchema.parse(data);
};
