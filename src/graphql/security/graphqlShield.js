import { shield, rule } from "graphql-shield";

const isAuthenticated = rule()((parent, args, ctx) => {
  return ctx.user !== null;
});

export const permissions = shield({
  Query: {
    "*": isAuthenticated,
  },
  Mutation: {
    "*": isAuthenticated,
  },
});
