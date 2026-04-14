import { z } from "zod";

export const contactValidation = z.object({
  email: z.string().email(),
  mobile: z.string().min(10).max(15),

  socials: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
      icon: z.object({
        url: z.string().url(),
        publicId: z.string(),
      }),
    }),
  ),

  address: z.string().min(5),
});
