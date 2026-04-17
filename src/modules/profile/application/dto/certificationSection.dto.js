import { z } from "zod";

export const certificationSectionDTO = z.object({
  heading: z.string().min(2),
  subHeading: z.string().optional(),
  description: z.string().optional(),
});
