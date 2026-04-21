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

    (async () => {
      try {
        const [projectsRes, skillsRes, expRes, servicesRes] = await Promise.all(
          [
            fetch(`/api/v1/profile/project?profileId=${profileId}`),
            fetch(`/api/v1/profile/skill?profileId=${profileId}`),
            fetch(`/api/v1/profile/experience?profileId=${profileId}`),
            fetch(`/api/v1/profile/service?profileId=${profileId}`),
          ],
        );

        const [projectsJson, skillsJson, expJson, servicesJson] =
          await Promise.all([
            projectsRes.json(),
            skillsRes.json(),
            expRes.json(),
            servicesRes.json(),
          ]);

        if (!isMounted) return;

        setProjects(projectsJson.data || []);
        setSkills(skillsJson.data || []);
        setExperience(expJson.data || []);

        setStats({
          projects: projectsJson.data?.length || 0,
          skills: skillsJson.data?.length || 0,
          experience: expJson.data?.length || 0,
          services: servicesJson.data?.length || 0,
        });

        setLoading(false);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [hydrated, profileId]);

  if (!route || !hydrated || profileLoading) return null;

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
