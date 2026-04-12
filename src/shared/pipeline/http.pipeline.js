import cors from "cors";
import { corsOptions } from "../config/cors";

export const applyHttpMiddleware = (app) => {
  app.use(cors(corsOptions));
};
