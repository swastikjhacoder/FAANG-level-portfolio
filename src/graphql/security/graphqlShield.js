import { shield, rule, allow } from "graphql-shield";
import { GraphQLError } from "graphql";

const isAuthenticated = rule({ cache: "contextual" })(async (
  parent,
  args,
  ctx,
) => {
  if (!ctx.user) {
    throw new GraphQLError("Authentication required", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return true;
});

const hasRole = (roles) =>
  rule({ cache: "contextual" })(async (parent, args, ctx) => {
    if (!ctx.user) {
      throw new GraphQLError("Authentication required", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    if (!roles.includes(ctx.user.role)) {
      throw new GraphQLError("Forbidden", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    return true;
  });

export const permissions = shield(
  {
    Query: {
      me: isAuthenticated,
    },

    Mutation: {
      login: allow,
      register: allow,
      refreshToken: allow,
      logout: isAuthenticated,
    },
  },
  {
    allowExternalErrors: false,
    fallbackRule: allow,
    fallbackError: new GraphQLError("Not authorized", {
      extensions: { code: "FORBIDDEN" },
    }),
  },
);
