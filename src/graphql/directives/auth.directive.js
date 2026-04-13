import { defaultFieldResolver, GraphQLError } from "graphql";

export const authDirective = (schema, directiveName = "auth") => {
  const typeMap = schema.getTypeMap();

  Object.values(typeMap).forEach((type) => {
    if (!type.getFields || type.name.startsWith("__")) return;

    const fields = type.getFields();

    Object.values(fields).forEach((field) => {
      const astNode = field.astNode;
      if (!astNode?.directives?.length) return;

      const authDirectiveNode = astNode.directives.find(
        (d) => d.name.value === directiveName,
      );
      if (!authDirectiveNode) return;

      const originalResolver = field.resolve || defaultFieldResolver;

      const args = authDirectiveNode.arguments || [];
      const roleArg = args.find((arg) => arg.name.value === "role");
      const requiredRole = roleArg?.value?.value || null;

      field.resolve = async function (parent, args, context, info) {
        const { user } = context;

        if (!user) {
          throw new GraphQLError("Authentication required", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }

        if (requiredRole && user.role !== requiredRole) {
          throw new GraphQLError("Forbidden: insufficient permissions", {
            extensions: { code: "FORBIDDEN" },
          });
        }

        return originalResolver.call(this, parent, args, context, info);
      };
    });
  });

  return schema;
};
