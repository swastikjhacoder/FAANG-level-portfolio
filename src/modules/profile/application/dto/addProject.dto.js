import { z } from "zod";

export const addProjectDTO = z
  .object({
    profileId: z.string(),

    name: z.string().min(2),

    liveUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),

    techStack: z.array(
      z.object({
        name: z.string(),
        icon: z.object({
          url: z.string().url(),
          publicId: z.string(),
        }),
      }),
    ),

    description: z.array(z.string()),

    screenshot: z
      .object({
        url: z.string().url(),
        publicId: z.string(),
      })
      .optional(),
  })
  .strict();
