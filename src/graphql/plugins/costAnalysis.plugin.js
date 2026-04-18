import { GraphQLError } from "graphql";

export const costAnalysisPlugin = (maxCost = 1000) => ({
  onResolverCalled({ info }) {
    const fieldCost =
      info.parentType?.getFields?.()[info.fieldName]?.extensions?.complexity ||
      1;

    info.context.__cost = (info.context.__cost || 0) + fieldCost;

    if (info.context.__cost > maxCost) {
      throw new GraphQLError("Query cost exceeded limit", {
        extensions: { code: "QUERY_COST_EXCEEDED" },
      });
    }
  },
});
