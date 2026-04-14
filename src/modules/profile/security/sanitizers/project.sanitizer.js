import { cleanString, cleanArray } from "@/shared/utils/sanitizer.js";

export const sanitizeProjectInput = (data) => {
  return {
    ...data,

    name: cleanString(data.name),
    liveUrl: cleanString(data.liveUrl),
    githubUrl: cleanString(data.githubUrl),

    description: cleanArray(data.description),

    techStack: (data.techStack || []).map((t) => ({
      name: cleanString(t.name),
      icon: t.icon || null,
    })),
  };
};
