import { z } from "zod";

export const serviceSectionDTO = z.object({
  heading: z.string().max(150),
  subHeading: z.string().max(150),
  description: z.string().max(150),
});
