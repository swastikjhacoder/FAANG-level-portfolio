import { cache } from "react";
import React from "react";

import ProfileSection from "@/components/public/sections/ProfileSection";
import SoftSkillSection from "@/components/public/sections/SoftSkillSection";
import SoftSkills from "@/components/public/sections/SoftSkills";
import AboutSection from "@/components/public/sections/AboutSection";
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
import ServiceSection from "@/components/public/sections/ServiceSection";
import Services from "@/components/public/sections/Services";
import Testimonial from "@/components/public/sections/Testimonial";
import TestimonialSection from "@/components/public/sections/TestimonialSection";
import ContactSection from "@/components/public/sections/ContactSection";
import Contact from "@/components/public/sections/Contact";
import ScrollHandler from "@/components/public/utils/ScrollHandler";
import BackToTopButton from "@/components/public/ui/BackToTopButton";
import FloatingShapes from "@/components/public/ui/FloatingShapes";

export const dynamic = "force-dynamic";
export const revalidate = 60;

async function baseFetch({ path, query = {}, errorMessage = "Fetch failed" }) {
  let url;

  if (typeof window === "undefined") {
    const base =
      process.env.APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://127.0.0.1:3000");

    url = new URL(path, base);
  } else {
    url = new URL(path, window.location.origin);
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
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

const getSoftSkillSection = createFetcher({
  path: "/api/v1/profile/softSkillSection",
});

const getSoftSkills = createFetcher({
  path: "/api/v1/profile/softSkill",
});

const getAboutData = createFetcher({
  path: "/api/v1/profile/aboutSection",
});

const getCoreCompetency = createFetcher({
  path: "/api/v1/profile/coreCompetencySection",
});

const getSkillSection = createFetcher({
  path: "/api/v1/profile/skillSection",
});

const getProfileSummary = createFetcher({
  path: "/api/v1/profile/profileSummary",
});

const getCoreCompetencyItems = createFetcher({
  path: "/api/v1/profile/coreCompetency",
});

const getSkills = createFetcher({
  path: "/api/v1/profile/skill",
});

const getExperienceSection = createFetcher({
  path: "/api/v1/profile/experienceSection",
});

const getExperiences = createFetcher({
  path: "/api/v1/profile/experience",
});

const getAcademicSection = createFetcher({
  path: "/api/v1/profile/academicSection",
});

const getEducation = createFetcher({
  path: "/api/v1/profile/education",
});

const getProjectSection = createFetcher({
  path: "/api/v1/profile/projectSection",
});

const getProjects = createFetcher({
  path: "/api/v1/profile/project",
});

const getServiceSection = createFetcher({
  path: "/api/v1/profile/serviceSection",
});

const getServices = createFetcher({
  path: "/api/v1/profile/service",
});

const getTestimonials = createFetcher({
  path: "/api/v1/profile/testimonial",
});

const getContactSection = createFetcher({
  path: "/api/v1/profile/contactSection",
});

const getContact = createFetcher({
  path: "/api/v1/profile/contact",
});

const Section = ({ id, title, children, className = "" }) => (
  <section
    id={id}
    className={`relative z-10 w-full min-h-screen flex items-center py-16 sm:py-20 border-b border-[var(--glass-border)] ${className}`}
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

const Home = async () => {
  const [
    aboutRes,
    profileRes,
    coreRes,
    skillRes,
    experienceRes,
    academicRes,
    projectSectionRes,
    serviceSectionRes,
    contactSectionRes,
    softSkillSectionRes,
  ] = await Promise.all([
    getAboutData({}),
    getProfile({}),
    getCoreCompetency({}),
    getSkillSection({}),
    getExperienceSection({}),
    getAcademicSection({}),
    getProjectSection({}),
    getServiceSection({}),
    getContactSection({}),
    getSoftSkillSection({}),
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
    servicesRes,
    testimonialsRes,
    contactRes,
    softSkillsRes,
  ] = await Promise.all([
    getProfileSummary({ query: { profileId: profile._id } }),
    getCoreCompetencyItems({ query: { profileId: profile._id } }),
    getSkills({ query: { profileId: profile._id } }),
    getExperiences({ query: { profileId: profile._id } }),
    getEducation({ query: { profileId: profile._id } }),
    getProjects({ query: { profileId: profile._id } }),
    getServices({ query: { profileId: profile._id } }),
    getTestimonials({ query: { profileId: profile._id } }),
    getContact({ query: { profileId: profile._id } }),
    getSoftSkills({ query: { profileId: profile._id } }),
  ]);

  const approvedTestimonials =
    testimonialsRes?.data?.filter((t) => t.approved && !t.isDeleted) || [];

  return (
    <main className="pt-16 sm:pt-20">
      <FloatingShapes />

      <ScrollHandler />
      <BackToTopButton />

      <Section id="home" className="border-none">
        <div className="space-y-10">
          <FadeInSection>
            <ProfileSection data={profile} />
          </FadeInSection>
          <FadeInSection>
            <div className="space-y-10">
              <SoftSkillSection data={softSkillSectionRes.data} />
              <SoftSkills data={softSkillsRes.data} />
            </div>
          </FadeInSection>
        </div>
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
            <CoreCompetencySection data={coreRes.data} />
            <CoreCompetencyList data={competencyItemsRes.data} />
          </FadeInSection>

          <SkillSection data={skillRes.data} />
          <Skills data={skillsRes.data} />
        </div>
      </Section>

      <Section id="experience">
        <FadeInSection>
          <ExperienceSection data={experienceRes.data} />
        </FadeInSection>
        <ExperienceList data={experiencesRes.data} />
      </Section>

      <Section id="academic">
        <FadeInSection>
          <AcademicSection data={academicRes.data} />
          <AcademicList data={educationRes.data} />
        </FadeInSection>
      </Section>

      <Section id="projects">
        <FadeInSection>
          <ProjectSection data={projectSectionRes.data} />
          <Projects data={projectsRes.data} />
        </FadeInSection>
      </Section>

      <Section id="services">
        <FadeInSection>
          <ServiceSection data={serviceSectionRes.data} />
          <Services data={servicesRes.data} />
        </FadeInSection>
      </Section>

      {approvedTestimonials.length > 0 && (
        <Section id="testimonial">
          <FadeInSection>
            <TestimonialSection />
            <Testimonial data={approvedTestimonials} />
          </FadeInSection>
        </Section>
      )}

      <Section id="contact">
        <FadeInSection>
          <ContactSection data={contactSectionRes.data} />
          <Contact data={contactRes.data} />
        </FadeInSection>
      </Section>
    </main>
  );
};

export default Home;
