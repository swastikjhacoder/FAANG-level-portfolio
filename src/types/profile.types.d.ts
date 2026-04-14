export type Image = {
  url: string;
  publicId: string;
};

export type Name = {
  first: string;
  last: string;
};

export type TechStack = {
  name: string;
  icon?: Image;
};

export type Skill = {
  id?: string;
  profileId: string;
  name: string;
  experience: number;
  proficiency: number;
  icon?: Image | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Experience = {
  id?: string;
  profileId: string;
  company: string;
  role: string;
  startDate: Date;
  endDate?: Date | null;
  history?: string[];
  achievements?: string[];
  projects?: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type Project = {
  id?: string;
  profileId: string;
  name: string;
  liveUrl?: string | null;
  githubUrl?: string | null;
  techStack: TechStack[];
  description: string[];
  screenshot?: Image | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Testimonial = {
  id?: string;
  profileId: string;
  quote: string;
  senderName: string;
  senderRole?: string | null;
  company?: string | null;
  approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Profile = {
  id?: string;
  name: Name;
  roles: string[];
  description: string[];
  profileImage?: Image | null;
  dateOfBirth?: Date | null;
  maritalStatus?: "single" | "married" | "other";
  languages?: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type FullProfile = Profile & {
  skills?: Skill[];
  experiences?: Experience[];
  projects?: Project[];
  testimonials?: Testimonial[];
};

export type Contact = {
  profileId: string;
  email: string;
  mobile: string;
  socials: {
    name: string;
    url: string;
    icon?: Image | null;
  }[];
  address: string;
};

export type Certification = {
  profileId: string;
  organization: string;
  certificationName: string;
  startDate?: Date;
  endDate?: Date;
};

export type Education = {
  profileId: string;
  institution: string;
  boardOrUniversity?: string;
  degree?: string;
  specializations?: string[];
  startDate?: Date;
  endDate?: Date;
};

export type Service = {
  profileId: string;
  heading: string;
  icon?: Image | null;
  subheading?: string;
  description?: string;
};

export type CoreCompetency = {
  profileId: string;
  heading: string;
  description: string;
  icon?: Image | null;
};

export type ProfileSummary = {
  profileId: string;
  items: string[];
};
