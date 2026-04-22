import { z } from "zod";

export const coreCompetencyItemDTO = z.object({
  profileId: z.string(),
  items: z.array(z.string().min(2).max(100)).min(1),
});
