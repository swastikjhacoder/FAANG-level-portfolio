import { z } from "zod";

export const addCertificationDTO = z.object({
  profileId: z.string().min(1, "Profile ID is required"),

  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title is too long"),

  issuer: z
    .string()
    .min(2, "Issuer must be at least 2 characters")
    .max(150, "Issuer is too long"),

  issueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid issue date",
  }),

  expiryDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid expiry date",
    }),

  credentialId: z.string().max(100, "Credential ID too long").optional(),

  credentialUrl: z.string().url("Invalid URL").optional(),

  description: z.string().max(500, "Description too long").optional(),
});
