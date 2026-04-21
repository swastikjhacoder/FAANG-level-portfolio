import { z } from "zod";

export const addCertificationDTO = z.object({
  profileId: z.string(),
  content: z.object({
    certificationName: z.string().min(2),
    organization: z.string().min(2),
    issueDate: z.string(),
    certificateFileUrl: z.string().url().optional(),
    description: z.string().optional(),
  }),
});