import { createYoga } from "graphql-yoga";

export async function getYoga() {
  const { schema } = await import("./schema");
  const { createContext } = await import("./context");
  const { depthLimitRule } = await import("./plugins/depthLimit.plugin");
  const { disableIntrospectionRule } =
    await import("./security/disableIntrospection");

  return createYoga({
    schema,
    context: createContext,

    plugins: [
      {
        onExecute() {
          if (process.env.NODE_ENV !== "production") {
            console.log("GraphQL execution started");
          }
        },
      },
    ],

    validationRules: [
      depthLimitRule,
      ...(process.env.NODE_ENV === "production"
        ? [disableIntrospectionRule]
        : []),
    ],

    cors: false,
    graphiql: process.env.NODE_ENV !== "production",
  });
}
