"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { dashboardRoutes } from "@/config/dashboardRoutes";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfile } from "@/modules/profile/hooks/useProfile";

import StatCard from "@/components/dashboard/ui/StatCard";
import SkillsBarChart from "@/components/dashboard/ui/chart/SkillsBarChart";
import TechStackPieChart from "@/components/dashboard/ui/chart/TechStackPieChart";
import ExperienceTimeline from "@/components/dashboard/ui/chart/ExperienceTimeline";
import { secureFetch } from "@/shared/lib/secureFetch";

export default function DashboardPage() {
  const route = dashboardRoutes.find((r) => r.href === "/dashboard");

  const { hydrated } = useAuthStore();
  const { profile, loading: profileLoading } = useProfile();

  const profileId = profile?._id;

  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    experience: 0,
    services: 0,
  });

  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated || !profileId) return;

    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [projectsJson, skillsJson, expJson, servicesJson] =
          await Promise.all([
            secureFetch(`/api/v1/profile/project?profileId=${profileId}`),
            secureFetch(`/api/v1/profile/skill?profileId=${profileId}`),
            secureFetch(`/api/v1/profile/experience?profileId=${profileId}`),
            secureFetch(`/api/v1/profile/service?profileId=${profileId}`),
          ]);

        if (!isMounted) return;

        const projectsData = projectsJson?.data || [];
        const skillsData = skillsJson?.data || [];
        const expData = expJson?.data || [];
        const servicesData = servicesJson?.data || [];

        setProjects(projectsData);
        setSkills(skillsData);
        setExperience(expData);

        setStats({
          projects: projectsData.length,
          skills: skillsData.length,
          experience: expData.length,
          services: servicesData.length,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [hydrated, profileId]);

  if (!route) return null;

  if (!hydrated || profileLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (!profileId) {
    return <div className="p-6">No profile found</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader title={route.name} icon={route.icon} />
      <div className="border-t border-gray-200 dark:border-gray-800" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Projects"
          value={stats.projects}
          description="Total projects"
          loading={loading}
        />

        <StatCard
          title="Skills"
          value={stats.skills}
          description="Technologies added"
          loading={loading}
        />

        <StatCard
          title="Experience"
          value={stats.experience}
          description="Work history"
          loading={loading}
        />

        <StatCard
          title="Services"
          value={stats.services}
          description="Services offered"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillsBarChart data={skills} />
        <TechStackPieChart projects={projects} />
      </div>

      <ExperienceTimeline data={experience} />
    </div>
  );
}
