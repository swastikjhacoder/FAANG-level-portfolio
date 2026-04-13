import { GraphQLError } from "graphql";

export const costAnalysisPlugin = (maxCost = 1000) => ({
  async requestDidStart() {
    let cost = 0;

    return {
      executionDidStart() {
        return {
          willResolveField({ info }) {
            const fieldCost =
              info.parentType?.getFields?.()[info.fieldName]?.extensions
                ?.complexity || 1;

            cost += fieldCost;

            if (cost > maxCost) {
              throw new GraphQLError("Query cost exceeded limit", {
                extensions: { code: "QUERY_COST_EXCEEDED" },
              });
            }
          },
        };
      },
    };
  },
});
