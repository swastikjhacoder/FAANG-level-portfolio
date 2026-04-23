import { cache } from "react";
import React from "react";
import AboutSection from "@/components/public/sections/AboutSection";
import ProfileSection from "@/components/public/sections/ProfileSection";
import ProfileSummarySection from "@/components/public/sections/ProfileSummarySection";
import CoreCompetencySection from "@/components/public/sections/CoreCompetencySection";
import CoreCompetencyList from "@/components/public/sections/CoreCompetencyList";
import SkillSection from "@/components/public/sections/SkillSection";
import Skills from "@/components/public/sections/Skills";
import ExperienceSection from "@/components/public/sections/ExperienceSection";
import FadeInSection from "@/components/public/ui/FadeInSection";
import ExperienceList from "@/components/public/sections/ExperienceList";
import AcademicSection from "@/components/public/sections/AcademicSection";
import AcademicList from "@/components/public/sections/AcademicList";
import ProjectSection from "@/components/public/sections/ProjectSection";
import Projects from "@/components/public/sections/Projects";

function getBaseUrl() {
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

const REVALIDATE = 60;

async function baseFetch({
  baseUrl,
  path,
  query = {},
  errorMessage = "Fetch failed",
}) {
  const url = new URL(path, baseUrl);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  const res = await fetch(url.toString(), {
    next: { revalidate: REVALIDATE },
  });

  if (!res.ok) {
    throw new Error(`${errorMessage} (${res.status})`);
  }

  return res.json();
}

function createFetcher(config) {
  return cache(async (params) => {
    return baseFetch({
      ...config,
      ...params,
    });
  });
}

const getProfile = createFetcher({
  path: "/api/v1/profile/public",
  errorMessage: "Failed to fetch profile",
});

const getAboutData = createFetcher({
  path: "/api/v1/profile/aboutSection",
  errorMessage: "Failed to fetch About Section",
});

const getCoreCompetency = createFetcher({
  path: "/api/v1/profile/coreCompetencySection",
  errorMessage: "Failed to fetch Core Competency",
});

const getSkillSection = createFetcher({
  path: "/api/v1/profile/skillSection",
  errorMessage: "Failed to fetch Skill Section",
});

const getProfileSummary = createFetcher({
  path: "/api/v1/profile/profileSummary",
  errorMessage: "Failed to fetch Profile Summary",
});

const getCoreCompetencyItems = createFetcher({
  path: "/api/v1/profile/coreCompetency",
  errorMessage: "Failed to fetch Core Competency Items",
});

const getSkills = createFetcher({
  path: "/api/v1/profile/skill",
  errorMessage: "Failed to fetch skills",
});

const getExperienceSection = createFetcher({
  path: "/api/v1/profile/experienceSection",
  errorMessage: "Failed to fetch Experience Section",
});

const getExperiences = createFetcher({
  path: "/api/v1/profile/experience",
  errorMessage: "Failed to fetch experiences",
});

const getAcademicSection = createFetcher({
  path: "/api/v1/profile/academicSection",
  errorMessage: "Failed to fetch Academic Section",
});

const getEducation = createFetcher({
  path: "/api/v1/profile/education",
  errorMessage: "Failed to fetch education",
});

const getProjectSection = createFetcher({
  path: "/api/v1/profile/projectSection",
  errorMessage: "Failed to fetch Project Section",
});

const getProjects = createFetcher({
  path: "/api/v1/profile/project",
  errorMessage: "Failed to fetch projects",
});

const Section = ({ id, title, children, className = "" }) => {
  return (
    <section
      id={id}
      className={`w-full min-h-screen flex items-center py-16 sm:py-20 border-b border-[var(--glass-border)] ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {title && (
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 gradient-text">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
};

const Home = async () => {
  const baseUrl = getBaseUrl();

  const [
    aboutRes,
    profileRes,
    coreRes,
    skillRes,
    experienceRes,
    academicRes,
    projectSectionRes,
  ] = await Promise.all([
    getAboutData({ baseUrl }),
    getProfile({ baseUrl }),
    getCoreCompetency({ baseUrl }),
    getSkillSection({ baseUrl }),
    getExperienceSection({ baseUrl }),
    getAcademicSection({ baseUrl }),
    getProjectSection({ baseUrl }),
  ]);

  const profile = profileRes.data;

  if (!profile?._id) {
    throw new Error("Profile ID missing");
  }

  const [
    summaryRes,
    competencyItemsRes,
    skillsRes,
    experiencesRes,
    educationRes,
    projectsRes,
  ] = await Promise.all([
    getProfileSummary({
      baseUrl,
      query: { profileId: profile._id },
    }),
    getCoreCompetencyItems({
      baseUrl,
      query: { profileId: profile._id },
    }),
    getSkills({
      baseUrl,
      query: { profileId: profile._id },
    }),
    getExperiences({
      baseUrl,
      query: { profileId: profile._id },
    }),
    getEducation({
      baseUrl,
      query: { profileId: profile._id },
    }),
    getProjects({
      baseUrl,
      query: { profileId: profile._id },
    }),
  ]);

  return (
    <main className="pt-16 sm:pt-20">
      <Section id="home" className="border-none">
        <FadeInSection>
          <ProfileSection data={profile} />
        </FadeInSection>
      </Section>

      <Section id="about">
        <FadeInSection>
          <div className="space-y-10">
            <AboutSection data={aboutRes.data} />
            <ProfileSummarySection data={summaryRes.data} />
          </div>
        </FadeInSection>
      </Section>

      <Section id="skills">
        <div className="space-y-10">
          <FadeInSection>
            <div className="space-y-10">
              <CoreCompetencySection data={coreRes.data} />
              <CoreCompetencyList data={competencyItemsRes.data} />
            </div>
          </FadeInSection>

          <div className="space-y-10">
            <SkillSection data={skillRes.data} />
            <Skills data={skillsRes.data} />
          </div>
        </div>
      </Section>

      <Section id="experience">
        <div className="space-y-12">
          <FadeInSection>
            <ExperienceSection data={experienceRes.data} />
          </FadeInSection>
          <ExperienceList data={experiencesRes.data} />
        </div>
      </Section>

      <Section id="academic">
        <div className="space-y-12">
          <FadeInSection>
            <AcademicSection data={academicRes.data} />
          </FadeInSection>

          <FadeInSection>
            <AcademicList data={educationRes.data} />
          </FadeInSection>
        </div>
      </Section>

      <Section id="projects">
        <div className="space-y-12">
          <FadeInSection>
            <ProjectSection data={projectSectionRes.data} />
          </FadeInSection>

          <FadeInSection>
            <Projects data={projectsRes.data} />
          </FadeInSection>
        </div>
      </Section>

      <Section id="services" title="Services">
        <p className="text-gray-600 dark:text-gray-400">What you offer...</p>
      </Section>

      <Section id="contact" title="Contact">
        <p className="text-gray-600 dark:text-gray-400">Contact details...</p>
      </Section>
    </main>
  );
};

export default Home;
