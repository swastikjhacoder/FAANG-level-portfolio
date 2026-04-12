import { shield, rule, allow } from "graphql-shield";

const isAuthenticated = rule({ cache: "contextual" })(async (
  parent,
  args,
  ctx,
) => {
  return !!ctx.user;
});

const hasRole = (roles) =>
  rule({ cache: "contextual" })(async (parent, args, ctx) => {
    if (!ctx.user) return false;
    return roles.includes(ctx.user.role);
  });

export const permissions = shield(
  {
    Query: {
      "*": isAuthenticated,
    },

    Mutation: {
      login: allow,
      register: allow,
      refreshToken: allow,

      logout: isAuthenticated,

      "*": isAuthenticated,
    },
  },
  {
    allowExternalErrors: false,
    fallbackRule: allow,
    fallbackError: new Error("Not authorized"),
  },
);
