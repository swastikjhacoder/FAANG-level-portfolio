import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeResolvers } from "@graphql-tools/merge";

import { authDirective } from "./directives/auth.directive";
import { rateLimitDirective } from "./directives/rateLimit.directive";

import authTypeDefs from "@/modules/auth/interface/graphql/auth.schema";
import authResolvers from "@/modules/auth/interface/graphql/auth.resolver";

import profileTypeDefs from "@/modules/profile/interface/graphql/profile.schema";
import profileResolvers from "@/modules/profile/interface/graphql/profile.resolver";

const { rateLimitDirectiveTypeDefs, rateLimitDirectiveTransformer } =
  rateLimitDirective;

const baseTypeDefs = `
  directive @auth(role: String) on FIELD_DEFINITION

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

const baseResolvers = {
  Query: {
    _empty: () => "OK",
  },
};

let schema = makeExecutableSchema({
  typeDefs: [
    baseTypeDefs,
    rateLimitDirectiveTypeDefs,
    authTypeDefs,
    profileTypeDefs,
  ],
  resolvers: mergeResolvers([
    baseResolvers,
    authResolvers,
    profileResolvers,
  ]),
});

schema = authDirective(schema);
schema = rateLimitDirectiveTransformer(schema);

export { schema };
