import { z } from "zod";

export const addCoreCompetencyDTO = z.object({
  profileId: z.string(),

  heading: z.string().min(2),

  description: z.string().optional(),
});
