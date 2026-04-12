import { makeExecutableSchema } from "@graphql-tools/schema";
import { authDirective } from "./directives/auth.directive";

import authTypeDefs from "@/modules/auth/interface/graphql/auth.schema";
import authResolvers from "@/modules/auth/interface/graphql/auth.resolver";

const baseTypeDefs = `
  directive @auth on FIELD_DEFINITION

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export let schema = makeExecutableSchema({
  typeDefs: [baseTypeDefs, authTypeDefs],
  resolvers: [authResolvers],
});

schema = authDirective(schema);
