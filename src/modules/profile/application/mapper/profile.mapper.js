export const toProfileEntity = (data) => {
  return {
    name: {
      first: data.name.first,
      last: data.name.last,
    },
    roles: data.roles,
    description: data.description,
    profileImage: data.profileImage || null,
    dateOfBirth: data.dateOfBirth || null,
    maritalStatus: data.maritalStatus || null,
    languages: data.languages || [],
  };
};

export const toSkillEntity = (data) => {
  return {
    profileId: data.profileId,
    name: data.name,
    experience: data.experience,
    proficiency: data.proficiency,
    icon: data.icon || null,
  };
};

export const toExperienceEntity = (data) => {
  return {
    profileId: data.profileId,
    company: data.company,
    role: data.role,
    startDate: data.startDate,
    endDate: data.endDate || null,
    history: data.history || [],
    achievements: data.achievements || [],
    projects: data.projects || [],
  };
};

export const toProjectEntity = (data) => {
  return {
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
  };
};

export const toTestimonialEntity = (data) => {
  return {
    profileId: data.profileId,
    quote: data.quote,
    senderName: data.senderName,
    senderRole: data.senderRole || null,
    company: data.company || null,
    approved: false,
  };
};

export const toPersistenceProfile = (entity, userId) => {
  return {
    ...entity,
    createdBy: userId,
    updatedBy: userId,
  };
};

export const toPersistenceUpdate = (entity, userId) => {
  return {
    ...entity,
    updatedBy: userId,
  };
};

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

    skills: doc.skills || [],
    experiences: doc.experiences || [],
    projects: doc.projects || [],
    testimonials: doc.testimonials || [],

    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};
