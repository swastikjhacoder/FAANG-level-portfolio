import { gql } from "graphql-tag";

export const authTypeDefs = gql`
  # ======================
  # 🔐 TYPES
  # ======================

  type User {
    id: ID!
    email: String!
    name: Name
    roles: [String!]!
  }

  type Name {
    firstName: String!
    lastName: String
    displayName: String
  }

  # ======================
  # 🔐 RESPONSES
  # ======================

  type AuthResponse {
    success: Boolean!
    message: String
  }

  type LoginResponse {
    success: Boolean!
    message: String
    accessToken: String
    sessionId: ID
    user: User
  }

  type RefreshResponse {
    success: Boolean!
    message: String
    accessToken: String
  }

  type RegisterResponse {
    success: Boolean!
    message: String
    user: User
  }

  # ======================
  # 🔐 INPUTS
  # ======================

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input LogoutInput {
    sessionId: ID
    logoutAll: Boolean
  }

  # ======================
  # 🔐 ROOT TYPES
  # ======================

  type Query {
    _empty: String
  }

  type Mutation {
    register(input: RegisterInput!): RegisterResponse!
    login(input: LoginInput!): LoginResponse!
    refreshToken: RefreshResponse!
    logout(input: LogoutInput): AuthResponse!
  }
`;
