import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeResolvers } from "@graphql-tools/merge";
import gql from "graphql-tag";

import { authDirective } from "./directives/auth.directive";

import { authTypeDefs } from "@/modules/auth/interface/graphql/auth.schema";
import { authResolvers } from "@/modules/auth/interface/graphql/auth.resolver";

import { profileTypeDefs } from "@/modules/profile/interface/graphql/profile.schema";
import { profileResolvers } from "@/modules/profile/interface/graphql/profile.resolver";

import {
  rateLimitDirectiveTypeDefs,
  rateLimitDirectiveTransformer,
} from "./directives/rateLimit.directive";

const { transformer: authDirectiveTransformer } = authDirective();

const baseTypeDefs = gql`
  directive @auth(role: String) on FIELD_DEFINITION

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

let schema = makeExecutableSchema({
  typeDefs: [
    baseTypeDefs,
    rateLimitDirectiveTypeDefs, 
    authTypeDefs,
    profileTypeDefs,
  ],
  resolvers: mergeResolvers([
    {
      Query: { _empty: () => "OK" },
    },
    authResolvers,
    profileResolvers,
  ]),
});

schema = authDirectiveTransformer(schema);
schema = rateLimitDirectiveTransformer(schema);

export { schema };
