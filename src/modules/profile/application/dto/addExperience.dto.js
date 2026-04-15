import { z } from "zod";

export const addExperienceDTO = z.object({
  profileId: z.string(),

  company: z.string().min(2),

  role: z.string().min(2), 

  employmentType: z.string().optional(),

  location: z.string().optional(),

  startDate: z.string(),

  endDate: z.string().optional(),

  currentlyWorking: z.boolean().optional(),

  description: z.string().optional(),
});
