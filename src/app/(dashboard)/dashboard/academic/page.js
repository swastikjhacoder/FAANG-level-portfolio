import PageHeader from "@/components/dashboard/ui/PageHeader";
import { dashboardRoutes } from "@/config/dashboardRoutes";

export default function AcademicPage() {
  const route = dashboardRoutes.find((r) => r.href === "/dashboard/academic");

  if (!route) return null;

  return (
    <div className="p-6">
      <PageHeader title={route.name} icon={route.icon} />
      <div className="border-t border-gray-200 dark:border-gray-800 mb-6" />

      <div>{/* Your content will go here */}</div>
    </div>
  );
}
