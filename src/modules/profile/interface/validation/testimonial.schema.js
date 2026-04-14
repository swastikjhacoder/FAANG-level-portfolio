import { z } from "zod";

export const testimonialValidation = z.object({
  quote: z.string().min(5).max(500),

  senderName: z.string().min(2),
  senderRole: z.string().optional(),
  company: z.string().optional(),
});
