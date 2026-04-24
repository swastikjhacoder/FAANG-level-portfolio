import { z } from "zod";

export const addSoftSkillSchema = z.object({
  profileId: z.string().min(1, "ProfileId is required"),

  items: z
    .array(z.string().trim().min(1).max(50, "Skill too long"))
    .min(1, "At least one skill required")
    .max(20, "Maximum 20 soft skills allowed"),
});
