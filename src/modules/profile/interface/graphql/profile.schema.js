import { gql } from "graphql-tag";

export const profileTypeDefs = gql`
  scalar Date

  enum MaritalStatus {
    SINGLE
    MARRIED
    OTHER
  }

  type Image {
    url: String!
    publicId: String!
  }

  type Name {
    first: String!
    last: String!
  }

  type Skill {
    id: ID!
    profileId: ID!
    name: String!
    experience: Int!
    proficiency: Int!
    icon: Image
  }

  type Experience {
    id: ID!
    profileId: ID!
    company: String!
    role: String!
    startDate: Date!
    endDate: Date
    history: [String!]
    achievements: [String!]
    projects: [String!]
  }

  type TechStack {
    name: String!
    icon: Image
  }

  type Project {
    id: ID!
    profileId: ID!
    name: String!
    liveUrl: String
    githubUrl: String
    techStack: [TechStack!]!
    description: [String!]!
    screenshot: Image
  }

  type Testimonial {
    id: ID!
    profileId: ID!
    quote: String!
    senderName: String!
    senderRole: String
    company: String
    approved: Boolean!
  }

  type Profile {
    id: ID!
    name: Name!
    roles: [String!]!
    description: [String!]!
    profileImage: Image
    dateOfBirth: Date
    maritalStatus: MaritalStatus
    languages: [String!]!

    skills: [Skill!]!
    experiences: [Experience!]!
    projects: [Project!]!
    testimonials: [Testimonial!]!

    createdAt: Date
    updatedAt: Date
  }

  input ImageInput {
    url: String!
    publicId: String!
  }

  input NameInput {
    first: String!
    last: String!
  }

  input CreateProfileInput {
    name: NameInput!
    roles: [String!]!
    description: [String!]!
    profileImage: ImageInput
    dateOfBirth: Date
    maritalStatus: MaritalStatus
    languages: [String!]
  }

  input UpdateProfileInput {
    name: NameInput
    roles: [String!]
    description: [String!]
    profileImage: ImageInput
    dateOfBirth: Date
    maritalStatus: MaritalStatus
    languages: [String!]
  }

  input SkillInput {
    profileId: ID!
    name: String!
    experience: Int!
    proficiency: Int!
    icon: ImageInput
  }

  input ExperienceInput {
    profileId: ID!
    company: String!
    role: String!
    startDate: Date!
    endDate: Date
    history: [String!]
    achievements: [String!]
    projects: [String!]
  }

  input TechStackInput {
    name: String!
    icon: ImageInput
  }

  input ProjectInput {
    profileId: ID!
    name: String!
    liveUrl: String
    githubUrl: String
    techStack: [TechStackInput!]!
    description: [String!]!
    screenshot: ImageInput
  }

  input TestimonialInput {
    profileId: ID!
    quote: String!
    senderName: String!
    senderRole: String
    company: String
  }

  type Query {
    profile(profileId: ID!): Profile
    profiles(page: Int = 1, limit: Int = 10): ProfilesResponse!
  }

  type ProfilesResponse {
    data: [Profile!]!
    meta: Meta!
  }

  type Meta {
    total: Int!
    page: Int!
    limit: Int!
    pages: Int!
  }

  type Mutation {
    createProfile(input: CreateProfileInput!): Profile!
      @auth(role: "ADMIN")
      @rateLimit(window: "1m", max: 10)

    updateProfile(profileId: ID!, input: UpdateProfileInput!): Profile!
      @auth(role: "ADMIN")
      @rateLimit(window: "1m", max: 20)

    deleteProfile(profileId: ID!): Boolean!
      @auth(role: "ADMIN")
      @rateLimit(window: "1m", max: 10)

    addSkill(input: SkillInput!): Skill!
      @auth(role: "ADMIN")
      @rateLimit(window: "1m", max: 50)

    addExperience(input: ExperienceInput!): Experience!
      @auth(role: "ADMIN")
      @rateLimit(window: "1m", max: 30)

    addProject(input: ProjectInput!): Project!
      @auth(role: "ADMIN")
      @rateLimit(window: "1m", max: 20)

    approveTestimonial(testimonialId: ID!): Testimonial!
      @auth(role: "ADMIN")
      @rateLimit(window: "1m", max: 20)
  }
`;
