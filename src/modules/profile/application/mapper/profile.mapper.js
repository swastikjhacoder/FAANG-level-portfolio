import { Experience } from "../../domain/entities/Experience.entity.js";
import { Profile } from "../../domain/entities/Profile.entity.js";
import { Project } from "../../domain/entities/Project.entity.js";
import { Skill } from "../../domain/entities/Skill.entity.js";
import { Testimonial } from "../../domain/entities/Testimonial.entity.js";

export const toProfileEntity = (data) => {
  const entity = new Profile({
    name: data.name,
    roles: data.roles,
    description: data.description,
    profileImage: data.profileImage || null,
    dateOfBirth: data.dateOfBirth || null,
    maritalStatus: data.maritalStatus || null,
    languages: data.languages || [],
  });

  entity.validate();

  return entity;
};

export const toSkillEntity = (data) => {
  const entity = new Skill({
    profileId: data.profileId,
    name: data.name,
    experience: data.experience,
    proficiency: data.proficiency,
    icon: data.icon || null,
  });

  entity.validate();

  return entity;
};

export const toExperienceEntity = (data) => {
  const entity = new Experience({
    profileId: data.profileId,
    company: data.company,
    role: data.role,
    startDate: data.startDate,
    endDate: data.endDate || null,
    history: data.history || [],
    achievements: data.achievements || [],
    projects: data.projects || [],
  });

  entity.validate();

  return entity;
};

export const toProjectEntity = (data) => {
  const entity = new Project({
    profileId: data.profileId,
    name: data.name,
    liveUrl: data.liveUrl || null,
    githubUrl: data.githubUrl || null,
    techStack: (data.techStack || []).map((t) => ({
      name: t.name,
      icon: t.icon || null,
    })),
    description: data.description || [],
    screenshot: data.screenshot || null,
  });

  entity.validate();

  return entity;
};

export const toTestimonialEntity = (data) => {
  const entity = new Testimonial({
    profileId: data.profileId,
    quote: data.quote,
    senderName: data.senderName,
    senderRole: data.senderRole || null,
    company: data.company || null,
    approved: false,
  });

  entity.validate();

  return entity;
};

export const toPersistenceProfile = (entity, userId) => {
  return {
    name: entity.name,
    roles: entity.roles,
    description: entity.description,
    profileImage: entity.profileImage,
    dateOfBirth: entity.dateOfBirth,
    maritalStatus: entity.maritalStatus,
    languages: entity.languages,
    createdBy: userId,
    updatedBy: userId,
  };
};

export const toPersistenceUpdate = (entity, userId) => {
  const data = {};

  if (entity.name !== undefined) data.name = entity.name;
  if (entity.roles !== undefined) data.roles = entity.roles;
  if (entity.description !== undefined) data.description = entity.description;
  if (entity.profileImage !== undefined)
    data.profileImage = entity.profileImage;
  if (entity.dateOfBirth !== undefined) data.dateOfBirth = entity.dateOfBirth;
  if (entity.maritalStatus !== undefined)
    data.maritalStatus = entity.maritalStatus;
  if (entity.languages !== undefined) data.languages = entity.languages;

  data.updatedBy = userId;

  return data;
};

const mapSubDoc = (doc) => ({
  id: doc._id?.toString(),
  profileId: doc.profileId,
  ...doc,
});

export const toResponseProfile = (doc) => {
  if (!doc) return null;

  return {
    id: doc._id?.toString(),
    name: doc.name,
    roles: doc.roles,
    description: doc.description,
    profileImage: doc.profileImage,
    dateOfBirth: doc.dateOfBirth,
    maritalStatus: doc.maritalStatus,
    languages: doc.languages,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

export const toResponseFullProfile = (doc) => {
  if (!doc) return null;

  return {
    id: doc._id?.toString(),
    name: doc.name,
    roles: doc.roles,
    description: doc.description,
    profileImage: doc.profileImage,
    dateOfBirth: doc.dateOfBirth,
    maritalStatus: doc.maritalStatus,
    languages: doc.languages,

    skills: (doc.skills || []).map(mapSubDoc),
    experiences: (doc.experiences || []).map(mapSubDoc),
    projects: (doc.projects || []).map(mapSubDoc),
    testimonials: (doc.testimonials || []).map(mapSubDoc),

    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};
