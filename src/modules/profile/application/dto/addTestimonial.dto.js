import { z } from "zod";

export const addTestimonialDTO = z
  .object({
    profileId: z.string(),

    quote: z.string().min(5).max(500),

    senderName: z.string().min(2),
    senderRole: z.string().optional(),
    company: z.string().optional(),
  })
  .strict();
