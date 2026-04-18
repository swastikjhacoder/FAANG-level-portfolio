import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { defaultFieldResolver, GraphQLError } from "graphql";

export const authDirective = () => ({
  transformer: (schema) =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const directive = getDirective(schema, fieldConfig, "auth")?.[0];
        if (!directive) return fieldConfig;

        const { resolve = defaultFieldResolver } = fieldConfig;

        fieldConfig.resolve = async (source, args, context, info) => {
          if (!context?.user) {
            throw new GraphQLError("Unauthorized", {
              extensions: { code: "UNAUTHORIZED" },
            });
          }

          if (directive.role && !context.user.roles?.includes(directive.role)) {
            throw new GraphQLError("Forbidden", {
              extensions: { code: "FORBIDDEN" },
            });
          }

          return resolve(source, args, context, info);
        };

        return fieldConfig;
      },
    }),
});
