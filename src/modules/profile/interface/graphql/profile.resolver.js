import { GraphQLError } from "graphql";

import { CreateProfileUseCase } from "../../application/useCases/createProfile.usecase.js";
import { UpdateProfileUseCase } from "../../application/useCases/updateProfile.usecase.js";
import { GetProfileUseCase } from "../../application/useCases/getProfile.usecase.js";
import { AddSkillUseCase } from "../../application/useCases/addSkill.usecase.js";
import { AddExperienceUseCase } from "../../application/useCases/addExperience.usecase.js";
import { AddProjectUseCase } from "../../application/useCases/addProject.usecase.js";
import { ApproveTestimonialUseCase } from "../../application/useCases/approveTestimonial.usecase.js";
import { DeleteEntityUseCase } from "../../application/useCases/deleteEntity.usecase.js";

import { ProfileRepository } from "../../infrastructure/persistence/profile.repository.js";

import { ProfileGuard } from "../../security/guards/profile.guard.js";
import { TestimonialPolicy } from "../../domain/policies/testimonial.policy.js";

import { createProfileDTO } from "../../application/dto/createProfile.dto.js";
import { updateProfileDTO } from "../../application/dto/updateProfile.dto.js";
import { addSkillDTO } from "../../application/dto/addSkill.dto.js";
import { addExperienceDTO } from "../../application/dto/addExperience.dto.js";
import { addProjectDTO } from "../../application/dto/addProject.dto.js";

import { sanitizeProfileInput } from "../../security/sanitizers/profile.sanitizer.js";
import { sanitizeExperienceInput } from "../../security/sanitizers/experience.sanitizer.js";
import { sanitizeProjectInput } from "../../security/sanitizers/project.sanitizer.js";
import { sanitizeSkillInput } from "../../security/sanitizers/skill.sanitizer.js";

const createProfileUC = new CreateProfileUseCase();
const updateProfileUC = new UpdateProfileUseCase();
const getProfileUC = new GetProfileUseCase();
const addSkillUC = new AddSkillUseCase();
const addExperienceUC = new AddExperienceUseCase();
const addProjectUC = new AddProjectUseCase();
const approveTestimonialUC = new ApproveTestimonialUseCase();
const deleteEntityUC = new DeleteEntityUseCase();

const profileRepo = new ProfileRepository();

const handleError = (err) => {
  if (err.name === "ZodError") {
    throw new GraphQLError(err.errors?.[0]?.message || "Validation failed", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  if (err.message === "Forbidden") {
    throw new GraphQLError("Forbidden", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  if (err.message === "Unauthorized") {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  throw new GraphQLError(err.message || "Internal Server Error", {
    extensions: { code: "INTERNAL_SERVER_ERROR" },
  });
};

const withErrorHandling =
  (resolver) =>
  async (...args) => {
    try {
      return await resolver(...args);
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

const mapId = (parent) => {
  if (parent?.id) return parent.id;
  if (parent?._id) return parent._id.toString();

  throw new GraphQLError("ID mapping failed", {
    extensions: { code: "INTERNAL_SERVER_ERROR" },
  });
};

export const profileResolvers = {
  Query: {
    profile: withErrorHandling(async (_, { profileId }) => {
      return getProfileUC.execute(profileId);
    }),

    profiles: withErrorHandling(async (_, { page = 1, limit = 10 }) => {
      return await profileRepo.list({ page, limit });
    }),
  },

  Mutation: {
    createProfile: withErrorHandling(async (_, { input }, { user }) => {
      ProfileGuard.assertCreate(user);

      const parsed = createProfileDTO.parse(input);
      const clean = sanitizeProfileInput(parsed);

      return createProfileUC.execute(clean, user);
    }),

    updateProfile: withErrorHandling(
      async (_, { profileId, input }, { user }) => {
        ProfileGuard.assertUpdate(user);

        const parsed = updateProfileDTO.parse(input);
        const clean = sanitizeProfileInput(parsed);

        return updateProfileUC.execute(profileId, clean, user);
      },
    ),

    deleteProfile: withErrorHandling(async (_, { profileId }, { user }) => {
      ProfileGuard.assertDelete(user);
      await deleteEntityUC.execute(profileId, user);
      return true;
    }),

    addSkill: withErrorHandling(async (_, { input }, { user }) => {
      ProfileGuard.assertUpdate(user);

      const parsed = addSkillDTO.parse(input);
      const clean = sanitizeSkillInput(parsed);

      return addSkillUC.execute(clean, user);
    }),

    addExperience: withErrorHandling(async (_, { input }, { user }) => {
      ProfileGuard.assertUpdate(user);

      const parsed = addExperienceDTO.parse(input);
      const clean = sanitizeExperienceInput(parsed);

      return addExperienceUC.execute(clean, user);
    }),

    addProject: withErrorHandling(async (_, { input }, { user }) => {
      ProfileGuard.assertUpdate(user);

      const parsed = addProjectDTO.parse(input);
      const clean = sanitizeProjectInput(parsed);

      return addProjectUC.execute(clean, user);
    }),

    approveTestimonial: withErrorHandling(
      async (_, { testimonialId }, { user }) => {
        TestimonialPolicy.assertApprove(user);
        return approveTestimonialUC.execute(testimonialId, user);
      },
    ),
  },

  Profile: { id: mapId },
  Skill: { id: mapId },
  Experience: { id: mapId },
  Project: { id: mapId },
  Testimonial: { id: mapId },
};
