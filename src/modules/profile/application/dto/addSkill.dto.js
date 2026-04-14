import { z } from "zod";

export const addSkillDTO = z
  .object({
    profileId: z.string().regex(/^[a-f\d]{24}$/i),

    name: z.string().min(2).max(50),

    experience: z.number().min(0).max(50),

    proficiency: z.number().min(0).max(10),

    icon: z
      .object({
        url: z.string().url(),
        publicId: z.string(),
      })
      .optional(),
  })
  .strict();
