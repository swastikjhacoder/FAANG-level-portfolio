import xss from "xss";

const cleanString = (value) => {
  if (!value) return value;
  return xss(value.trim());
};

const cleanArray = (arr = []) => arr.map(cleanString);

export const sanitizeProfileInput = (data) => {
  return {
    ...data,

    name: data.name && {
      first: cleanString(data.name.first),
      last: cleanString(data.name.last),
    },

    roles: cleanArray(data.roles),

    description: cleanArray(data.description),

    languages: cleanArray(data.languages),

    history: cleanArray(data.history),
    achievements: cleanArray(data.achievements),

    socials: data.socials?.map((s) => ({
      name: cleanString(s.name),
      url: cleanString(s.url),
    })),

    techStack: data.techStack?.map((t) => ({
      name: cleanString(t.name),
    })),

    quote: cleanString(data.quote),
    senderName: cleanString(data.senderName),
    senderRole: cleanString(data.senderRole),
    company: cleanString(data.company),
  };
};
