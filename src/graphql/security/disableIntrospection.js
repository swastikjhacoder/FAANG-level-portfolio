import { GraphQLError } from "graphql";

export const disableIntrospection = (context) => {
  if (process.env.NODE_ENV === "production") {
    return {
      ValidationRules: [
        (context) => ({
          Field(node) {
            if (
              node.name.value === "__schema" ||
              node.name.value === "__type"
            ) {
              throw new GraphQLError(
                "GraphQL introspection is disabled in production",
              );
            }
          },
        }),
      ],
    };
  }

  return {};
};
