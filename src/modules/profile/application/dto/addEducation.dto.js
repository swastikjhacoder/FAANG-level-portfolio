import { z } from "zod";

export const addEducationDTO = z.object({
  profileId: z.string().min(1, "profileId is required"),

  institution: z.string().min(2, "Institution must be at least 2 characters"),

  boardOrUniversity: z.string().optional(),

  degree: z.string().min(2, "Degree must be at least 2 characters"),

  fieldOfStudy: z.string().optional(),

  specializations: z.array(z.string()).optional(),

  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),

  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid end date",
    }),

  grade: z.string().optional(),

  description: z.string().optional(),
});
