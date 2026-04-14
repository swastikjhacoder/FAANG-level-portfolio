import { z } from "zod";

export const updateProfileDTO = z
  .object({
    name: z
      .object({
        first: z.string().min(2).max(50),
        last: z.string().min(2).max(50),
      })
      .optional(),

    roles: z.array(z.string().min(2)).optional(),

    description: z.array(z.string().min(5)).optional(),

    profileImage: z
      .object({
        url: z.string().url(),
        publicId: z.string(),
      })
      .optional(),

    dateOfBirth: z.coerce.date().optional(),

    maritalStatus: z.enum(["single", "married", "other"]).optional(),

    languages: z.array(z.string()).optional(),
  })
  .strict();
