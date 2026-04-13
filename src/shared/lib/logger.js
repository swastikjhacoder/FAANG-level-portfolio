const logger = {
  info: (msg, meta = {}) => {
    console.log(JSON.stringify({ level: "info", msg, ...meta }));
  },

  warn: (msg, meta = {}) => {
    console.warn(JSON.stringify({ level: "warn", msg, ...meta }));
  },

  error: (msg, meta = {}) => {
    console.error(JSON.stringify({ level: "error", msg, ...meta }));
  },

  debug: (msg, meta = {}) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(JSON.stringify({ level: "debug", msg, ...meta }));
    }
  },
};

export default logger;
