import AboutSection from "@/components/public/sections/AboutSection";
import ProfileSection from "@/components/public/sections/ProfileSection";
import ProfileSummarySection from "@/components/public/sections/ProfileSummarySection";
import { headers } from "next/headers";
import React from "react";

async function getBaseUrl() {
  const headersList = await headers();

  const host = headersList.get("host");

  const protocol =
    headersList.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "development" ? "http" : "https");

  return `${protocol}://${host}`;
}

async function getProfile(baseUrl) {
  const res = await fetch(`${baseUrl}/api/v1/profile/public`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch profile");

  return res.json();
}

async function getAboutData(baseUrl) {
  const res = await fetch(`${baseUrl}/api/v1/profile/aboutSection`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch About Section");

  return res.json();
}

async function getProfileSummary(baseUrl, profileId) {
  const res = await fetch(
    `${baseUrl}/api/v1/profile/profileSummary?profileId=${profileId}`,
    { cache: "no-store" },
  );

  if (!res.ok) throw new Error("Failed to fetch Profile Summary");

  return res.json();
}

const Section = ({ id, title, children, className = "" }) => {
  return (
    <section
      id={id}
      className={`w-full py-16 sm:py-20 border-b border-[var(--glass-border)] ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
  const baseUrl = await getBaseUrl();

  const [aboutRes, profileRes] = await Promise.all([
    getAboutData(baseUrl),
    getProfile(baseUrl),
  ]);

  const aboutData = aboutRes.data;
  const profile = profileRes.data;

  const summaryRes = await getProfileSummary(baseUrl, profile?._id);
  const profileSummary = summaryRes.data;

  return (
    <main className="pt-16 sm:pt-20">
      <Section id="home" className="border-none">
        <ProfileSection data={profile} />
      </Section>

      <Section id="about">
        <div className="space-y-10">
          <AboutSection data={aboutData} />
          <ProfileSummarySection data={profileSummary} />
        </div>
      </Section>

      <Section id="skills" title="Skills">
        <p className="text-gray-600 dark:text-gray-400">
          Your technical skills...
        </p>
      </Section>

      <Section id="experience" title="Experience">
        <p className="text-gray-600 dark:text-gray-400">
          Your work experience...
        </p>
      </Section>

      <Section id="academic" title="Academic">
        <p className="text-gray-600 dark:text-gray-400">
          Your education details...
        </p>
      </Section>

      <Section id="projects" title="Projects">
        <p className="text-gray-600 dark:text-gray-400">Your projects...</p>
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
