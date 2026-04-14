import { cleanString } from "@/shared/utils/sanitizer.js";

export const sanitizeSkillInput = (data) => {
  return {
    ...data,
    name: cleanString(data.name),
  };
};
