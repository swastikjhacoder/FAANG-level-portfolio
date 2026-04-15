import { z } from "zod";

export const coreCompetencyItemDTO = z.object({
  title: z.string().min(2).max(100).trim(),
  description: z.string().max(500).optional(),
});

export const coreCompetencySectionDTO = z.object({
  profileId: z.string(),
  heading: z.string().min(2).max(120).trim(),
  subHeading: z.string().max(150).optional(),
  description: z.string().max(1000).optional(),
});
