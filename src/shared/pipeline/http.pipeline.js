import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { corsOptions } from "../config/cors";
import rateLimitMiddleware from "@/shared/security/middleware/rateLimit.middleware";
import { xssSanitizer } from "@/shared/security/sanitizers/xss.sanitizer";
import { mongoSanitizer } from "@/shared/security/sanitizers/mongo.sanitizer";
import requestIdMiddleware from "@/shared/middleware/requestId.middleware";
import timeoutMiddleware from "@/shared/middleware/timeout.middleware";
import logger from "@/shared/lib/logger";
import express from "express";

export const applyHttpMiddleware = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  app.set("trust proxy", 1);
  
  app.use(express.json({ limit: "10kb" }));

  app.use(cors(corsOptions));

  app.use(compression());

  app.use(requestIdMiddleware);

  app.use(timeoutMiddleware("10s"));

  app.use(rateLimitMiddleware);

  app.use(mongoSanitizer);
  app.use(xssSanitizer);

  app.use((req, res, next) => {
    logger.info("HTTP_REQUEST", {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
    next();
  });
};
