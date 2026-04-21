import { z } from "zod";

export const updateCertificationDTO = z.object({
  content: z
    .object({
      certificationName: z.string().min(2).optional(),
      organization: z.string().min(2).optional(),
      issueDate: z.string().optional(),
      certificateFileUrl: z.string().url().optional(),
      description: z.string().optional(),
    })
    .strict(),
});
