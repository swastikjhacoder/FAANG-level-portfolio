import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import { createContext } from "./context";

import { complexityPlugin } from "./plugins/complexity.plugin";
import { costAnalysisPlugin } from "./plugins/costAnalysis.plugin";
import { depthLimitRule } from "./plugins/depthLimit.plugin";

import { permissions } from "./security/graphqlShield";
import { persistedQueryPlugin } from "./security/persistedQueries";
import { disableIntrospection } from "./security/disableIntrospection";

import { applyMiddleware } from "graphql-middleware";

const securedSchema = applyMiddleware(schema, permissions);

export const yoga = createYoga({
  schema: securedSchema,
  context: createContext,

  plugins: [
    complexityPlugin(schema),
    costAnalysisPlugin(),
    persistedQueryPlugin(),
  ],

  validationRules: [depthLimitRule],

  graphiql: process.env.NODE_ENV !== "production",

  maskedErrors: true,
});

export default yoga;
