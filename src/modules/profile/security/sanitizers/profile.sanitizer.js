import { cleanString, cleanArray } from "@/shared/utils/sanitizer.js";

export const sanitizeProfileInput = (data) => {
  return {
    ...data,

    name: data.name
      ? {
          first: cleanString(data.name.first),
          last: cleanString(data.name.last),
        }
      : undefined,

    roles: cleanArray(data.roles),

    description: cleanArray(data.description),

    languages: cleanArray(data.languages),
  };
};
