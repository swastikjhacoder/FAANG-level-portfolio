import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email too long")
    .email("Invalid email format")
    .transform((val) => val.toLowerCase().trim()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});
