import { cleanString, cleanArray } from "@/shared/utils/sanitizer.js";

export const sanitizeExperienceInput = (data) => {
  return {
    ...data,

    company: cleanString(data.company),
    role: cleanString(data.role),

    history: cleanArray(data.history),
    achievements: cleanArray(data.achievements),
    projects: cleanArray(data.projects),
  };
};
