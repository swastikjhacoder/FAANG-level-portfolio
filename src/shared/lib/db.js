import mongoose from "mongoose";
import { withTimeout } from "@/shared/utils/timeout";
import logger from "@/shared/lib/logger";
import { sanitizeMongoQuery } from "../security/sanitizers/mongo.sanitizer";

const MONGODB_URL = process.env.MONGODB_URL;
console.log("MONGO_URL:", process.env.MONGODB_URL);
console.log("ENV:", process.env.NODE_ENV);

if (!MONGODB_URL) {
  throw new Error("❌ MONGODB_URL is not defined");
}

const globalCache = global.__mongoose || {
  conn: null,
  promise: null,
};

global.__mongoose = globalCache;

let retryCount = 0;
const MAX_RETRIES = process.env.NODE_ENV === "production" ? 5 : 1;
let circuitState = "CLOSED";

const metrics = {
  totalConnections: 0,
  failedConnections: 0,
  totalRetries: 0,
  lastLatencyMs: 0,
};

mongoose.set("strictQuery", true);
mongoose.set("maxTimeMS", 5000);

if (process.env.NODE_ENV === "development") {
  mongoose.set("debug", true);
}

const connectDB = async () => {
  if (circuitState === "OPEN") {
    if (process.env.NODE_ENV !== "production") {
      circuitState = "HALF_OPEN";
    } else {
      throw new Error("🚫 DB unavailable (circuit open)");
    }
  }

  if (globalCache.conn) return globalCache.conn;

  if (!globalCache.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
      tls: true,
    };

    const start = Date.now();

    globalCache.promise = withTimeout(
      mongoose.connect(MONGODB_URL, options),
      7000,
    )
      .then((conn) => {
        metrics.totalConnections++;
        metrics.lastLatencyMs = Date.now() - start;

        logger.info("Mongo connected", {
          latency: metrics.lastLatencyMs,
        });

        return conn;
      })
      .catch((err) => {
        metrics.failedConnections++;
        throw err;
      });
  }

  try {
    globalCache.conn = await globalCache.promise;

    circuitState = "CLOSED";
    retryCount = 0;

    return globalCache.conn;
  } catch (err) {
    globalCache.promise = null;

    logger.error("Mongo connection failed", {
      message: err.message,
    });

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      metrics.totalRetries++;

      const delay = Math.min(1000 * 2 ** retryCount, 5000);

      await new Promise((res) => setTimeout(res, delay));
      return connectDB();
    }

    circuitState = "OPEN";

    setTimeout(() => {
      circuitState = "HALF_OPEN";
      retryCount = 0;
    }, 10000);

    throw new Error("❌ DB connection failed after retries");
  }
};

if (!global.__mongoose_exec_patched) {
  mongoose.Query.prototype.exec = (function (originalExec) {
    return function () {
      try {
        if (this._conditions) {
          this._conditions = sanitizeMongoQuery(this._conditions);
        }

        this.maxTimeMS(5000);
      } catch (err) {
        logger.error("Query sanitization failed", { error: err.message });
        throw err;
      }

      return originalExec.apply(this, arguments);
    };
  })(mongoose.Query.prototype.exec);

  global.__mongoose_exec_patched = true;
}

if (!global.__mongoose_shutdown_registered) {
  const shutdown = async (signal) => {
    try {
      await mongoose.connection.close();
      logger.info(`Mongo disconnected on ${signal}`);
    } catch (err) {
      logger.error("Error during Mongo shutdown", {
        message: err.message,
      });
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  global.__mongoose_shutdown_registered = true;
}

export const getDBHealth = () => ({
  status: circuitState === "OPEN" ? "down" : "up",
  circuit: circuitState,
  retries: retryCount,
  metrics,
});

export default connectDB;
