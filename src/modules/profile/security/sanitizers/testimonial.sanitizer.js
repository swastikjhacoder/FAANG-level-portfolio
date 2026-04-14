import { cleanString } from "@/shared/utils/sanitizer.js";

export const sanitizeTestimonialInput = (data) => {
  return {
    ...data,

    quote: cleanString(data.quote),
    senderName: cleanString(data.senderName),
    senderRole: cleanString(data.senderRole),
    company: cleanString(data.company),
  };
};
