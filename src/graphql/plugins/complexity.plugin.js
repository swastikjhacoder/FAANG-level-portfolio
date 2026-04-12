import {
  getComplexity,
  simpleEstimator,
  fieldExtensionsEstimator,
} from "graphql-query-complexity";

export const complexityPlugin = (schema, maxComplexity = 1000) => ({
  async requestDidStart() {
    return {
      didResolveOperation({ request, document }) {
        const complexity = getComplexity({
          schema,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        if (complexity > maxComplexity) {
          throw new Error(
            `Query is too complex: ${complexity}. Max allowed: ${maxComplexity}`,
          );
        }
      },
    };
  },
});
