import { z } from "zod";

export const addCertificationDTO = z.object({
  profileId: z.string(),

  content: z.object({
    certificationName: z.string().min(2),
    organization: z.string().min(2),

    issueDate: z.string(),
    expiryDate: z.string().optional(),

    credentialId: z.string().optional(),
    credentialUrl: z.string().url().optional(),
    description: z.string().optional(),
  }),
});
