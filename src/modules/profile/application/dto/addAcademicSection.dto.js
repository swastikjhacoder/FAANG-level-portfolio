import { z } from "zod";

export const addAcademicSectionDTO = z.object({
  heading: z.string().min(2).max(100),
  subHeading: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
});
