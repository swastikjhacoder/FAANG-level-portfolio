import { z } from "zod";

export const addProjectDTO = z
  .object({
    profileId: z.string(),

    name: z.string().min(2),

    liveUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),

    techStack: z.array(
      z.object({
        name: z.string().min(1),

        icon: z
          .object({
            url: z.string().url(),
            publicId: z.string(),
          })
          .optional()
          .nullable(),
      }),
    ),

    description: z.array(z.string().max(500)).max(50),

    screenshot: z
      .object({
        url: z.string().url(),
        publicId: z.string(),
      })
      .optional()
      .nullable(),
  })
  .strict();
