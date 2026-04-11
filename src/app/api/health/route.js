import { getDBHealth } from "@/shared/lib/db";

export async function GET() {
  const db = getDBHealth();

  return Response.json({
    status: db.status === "up" ? "ok" : "degraded",
    services: {
      db,
      api: "ok",
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
