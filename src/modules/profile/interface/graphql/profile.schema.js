import { gql } from "graphql-tag";

export const profileTypeDefs = gql`
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
    startDate: String!
    endDate: String
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
    techStack: [TechStack!]
    description: [String!]
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
    dateOfBirth: String
    maritalStatus: String
    languages: [String!]

    skills: [Skill!]
    experiences: [Experience!]
    projects: [Project!]
    testimonials: [Testimonial!]

    createdAt: String
    updatedAt: String
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
    dateOfBirth: String
    maritalStatus: String
    languages: [String!]
  }

  input UpdateProfileInput {
    name: NameInput
    roles: [String!]
    description: [String!]
    profileImage: ImageInput
    dateOfBirth: String
    maritalStatus: String
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
    startDate: String!
    endDate: String
    history: [String!]
    achievements: [String!]
    projects: [String!]
  }

  input TechStackInput {
    name: String!
    icon: ImageInput!
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
  }

  type Mutation {
    createProfile(input: CreateProfileInput!): Profile
    updateProfile(profileId: ID!, input: UpdateProfileInput!): Profile
    deleteProfile(profileId: ID!): Profile

    addSkill(input: SkillInput!): Skill
    addExperience(input: ExperienceInput!): Experience
    addProject(input: ProjectInput!): Project

    approveTestimonial(testimonialId: ID!): Testimonial
  }
`;
