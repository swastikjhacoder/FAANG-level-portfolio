import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeResolvers } from "@graphql-tools/merge";
import { authDirective } from "./directives/auth.directive";

import authTypeDefs from "@/modules/auth/interface/graphql/auth.schema";
import authResolvers from "@/modules/auth/interface/graphql/auth.resolver";

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
  typeDefs: [baseTypeDefs, authTypeDefs],
  resolvers: mergeResolvers([baseResolvers, authResolvers]),
});

schema = authDirective(schema);

export { schema };
