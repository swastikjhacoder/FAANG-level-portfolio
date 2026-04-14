import { CreateProfileUseCase } from "../../application/useCases/createProfile.usecase.js";
import { UpdateProfileUseCase } from "../../application/useCases/updateProfile.usecase.js";
import { GetProfileUseCase } from "../../application/useCases/getProfile.usecase.js";
import { AddSkillUseCase } from "../../application/useCases/addSkill.usecase.js";
import { AddExperienceUseCase } from "../../application/useCases/addExperience.usecase.js";
import { AddProjectUseCase } from "../../application/useCases/addProject.usecase.js";
import { ApproveTestimonialUseCase } from "../../application/useCases/approveTestimonial.usecase.js";
import { DeleteEntityUseCase } from "../../application/useCases/deleteEntity.usecase.js";

import { ProfileGuard } from "../../security/guards/profile.guard.js";
import { TestimonialPolicy } from "../../domain/policies/testimonial.policy.js";

const createProfileUC = new CreateProfileUseCase();
const updateProfileUC = new UpdateProfileUseCase();
const getProfileUC = new GetProfileUseCase();
const addSkillUC = new AddSkillUseCase();
const addExperienceUC = new AddExperienceUseCase();
const addProjectUC = new AddProjectUseCase();
const approveTestimonialUC = new ApproveTestimonialUseCase();
const deleteEntityUC = new DeleteEntityUseCase();

export const profileResolvers = {
  Query: {
    profile: async (_, { profileId }) => {
      return getProfileUC.execute(profileId);
    },
  },

  Mutation: {
    createProfile: async (_, { input }, { user }) => {
      ProfileGuard.assertCreate(user);
      return createProfileUC.execute(input, user);
    },

    updateProfile: async (_, { profileId, input }, { user }) => {
      ProfileGuard.assertUpdate(user);
      return updateProfileUC.execute(profileId, input, user);
    },

    deleteProfile: async (_, { profileId }, { user }) => {
      ProfileGuard.assertDelete(user);
      return deleteEntityUC.execute(profileId, user);
    },

    addSkill: async (_, { input }, { user }) => {
      ProfileGuard.assertUpdate(user);
      return addSkillUC.execute(input, user);
    },

    addExperience: async (_, { input }, { user }) => {
      ProfileGuard.assertUpdate(user);
      return addExperienceUC.execute(input, user);
    },

    addProject: async (_, { input }, { user }) => {
      ProfileGuard.assertUpdate(user);
      return addProjectUC.execute(input, user);
    },

    approveTestimonial: async (_, { testimonialId }, { user }) => {
      TestimonialPolicy.assertApprove(user);
      return approveTestimonialUC.execute(testimonialId, user);
    },
  },
};
