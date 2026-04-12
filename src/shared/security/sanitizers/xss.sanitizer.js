import xss from "xss";

const xssOptions = {
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script"],
  allowCommentTag: false,
};

const xssFilter = new xss.FilterXSS(xssOptions);

export const sanitizeString = (value) => {
  if (typeof value !== "string") return value;

  return xssFilter.process(value.trim());
};

export const sanitizeXSS = (data) => {
  if (typeof data === "string") {
    return sanitizeString(data);
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeXSS);
  }

  if (typeof data === "object" && data !== null) {
    const sanitized = {};

    for (const key of Object.keys(data)) {
      if (key === "__proto__" || key === "constructor") continue;

      sanitized[key] = sanitizeXSS(data[key]);
    }

    return sanitized;
  }

  return data;
};

export const sanitizeHeader = (value) => {
  if (!value) return "";

  return sanitizeString(value)
    .replace(/[\r\n]/g, "")
    .slice(0, 512);
};

export const sanitizeForLog = (value) => {
  if (!value) return "";

  return sanitizeString(value)
    .replace(/[\r\n\t]/g, " ")
    .slice(0, 1000);
};
