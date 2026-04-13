import { GraphQLError } from "graphql";

export const disableIntrospectionRule = () => ({
  Field(node) {
    if (node.name.value === "__schema" || node.name.value === "__type") {
      throw new GraphQLError(
        "GraphQL introspection is disabled in production",
        {
          extensions: { code: "INTROSPECTION_DISABLED" },
        },
      );
    }
  },
});
