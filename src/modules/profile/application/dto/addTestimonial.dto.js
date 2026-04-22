export const addTestimonialDTO = z
  .object({
    profileId: z.string(),

    quote: z.string().min(5).max(500),

    senderName: z.string().min(2),
    senderRole: z.string().optional(),
    company: z.string().optional(),

    senderImage: z
      .object({
        url: z.string().url(),
        publicId: z.string(),
      })
      .optional(),
  })
  .strict();
