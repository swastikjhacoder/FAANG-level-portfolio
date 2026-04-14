import { z } from "zod";
import { ROLES } from "@/shared/constants/roles";

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
  }),
  role: z.enum([
    ROLES.ADMIN,
    ROLES.MODERATOR,
    ROLES.USER,
  ]),
});
