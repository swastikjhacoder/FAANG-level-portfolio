import { z } from "zod";

export const coreCompetencySectionDTO = z.object({
  heading: z.string().trim().min(1).max(120),

  subHeading: z.string().trim().min(1).max(150),

  description: z.string().trim().min(10).max(1000),
});
