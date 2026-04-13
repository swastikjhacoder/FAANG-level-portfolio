import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import { createContext } from "./context";

import { complexityPlugin } from "./plugins/complexity.plugin";
import { depthLimitRule } from "./plugins/depthLimit.plugin";

import { permissions } from "./security/graphqlShield";
import { persistedQueryPlugin } from "./security/persistedQueries";
import { disableIntrospectionRule } from "./security/disableIntrospection";

import { applyMiddleware } from "graphql-middleware";

const securedSchema = applyMiddleware(schema, permissions);

export const yoga = createYoga({
  schema: securedSchema,

  context: createContext,

  plugins: [
    complexityPlugin(securedSchema),
    persistedQueryPlugin(),
    {
      async requestDidStart() {
        return {
          didResolveOperation({ request }) {
            if (process.env.NODE_ENV !== "production") {
              console.log("GraphQL Operation:", request.operationName);
            }
          },
        };
      },
    },
  ],

  validationRules: [
    depthLimitRule,
    ...(process.env.NODE_ENV === "production"
      ? [disableIntrospectionRule]
      : []),
  ],

  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || [],
    credentials: true,
  },

  graphiql: process.env.NODE_ENV !== "production",

  maskedErrors: {
    maskError: (err, message, isDev) => {
      if (isDev) return err;

      return {
        message: "Internal Server Error",
        extensions: {
          code: err.extensions?.code || "INTERNAL_ERROR",
        },
      };
    },
  },
});

export default yoga;
