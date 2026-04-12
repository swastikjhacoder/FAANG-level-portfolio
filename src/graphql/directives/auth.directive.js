import { defaultFieldResolver, GraphQLError } from "graphql";

export const authDirective = (schema, directiveName = "auth") => {
  const typeMap = schema.getTypeMap();

  Object.values(typeMap).forEach((type) => {
    if (!type.getFields) return;

    const fields = type.getFields();

    Object.values(fields).forEach((field) => {
      const directives = field.astNode?.directives || [];

      const authDirectiveNode = directives.find(
        (d) => d.name.value === directiveName,
      );

      if (!authDirectiveNode) return;

      const originalResolver = field.resolve || defaultFieldResolver;

      field.resolve = async function (parent, args, context, info) {
        if (!context.user) {
          throw new GraphQLError("Unauthorized", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }

        return originalResolver(parent, args, context, info);
      };
    });
  });

  return schema;
};
