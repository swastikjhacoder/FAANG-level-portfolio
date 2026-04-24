import { z } from "zod";

export const softSkillSectionSchema = z.object({
  heading: z.string().trim().min(1).max(100),
  subHeading: z.string().trim().max(200).optional(),
  description: z.string().trim().max(500).optional(),
});
