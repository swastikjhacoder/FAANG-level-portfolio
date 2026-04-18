import {
  getComplexity,
  simpleEstimator,
  fieldExtensionsEstimator,
} from "graphql-query-complexity";
import { GraphQLError } from "graphql";

export const complexityPlugin = (schema, maxComplexity = 1000) => ({
  onExecute({ args }) {
    const complexity = getComplexity({
      schema,
      query: args.document,
      variables: args.variableValues,
      estimators: [
        fieldExtensionsEstimator(),
        simpleEstimator({ defaultComplexity: 1 }),
      ],
    });

    if (complexity > maxComplexity) {
      throw new GraphQLError("Query too complex", {
        extensions: { code: "QUERY_TOO_COMPLEX" },
      });
    }
  },
});
