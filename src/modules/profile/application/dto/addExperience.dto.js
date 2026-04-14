import { z } from "zod";

export const addExperienceDTO = z
  .object({
    profileId: z.string(),

    company: z.string().min(2),
    role: z.string().min(2),

    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),

    history: z.array(z.string()).optional(),
    achievements: z.array(z.string()).optional(),
    projects: z.array(z.string()).optional(),
  })
  .strict();
