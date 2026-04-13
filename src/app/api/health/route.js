import { getDBHealth } from "@/shared/lib/db";
import { getRedis } from "@/shared/lib/redis";

export async function GET() {
  let db;
  let redisStatus = "down";

  try {
    db = getDBHealth();
  } catch {
    db = { status: "down" };
  }

  try {
    const client = await getRedis();
    await client.ping();
    redisStatus = "up";
  } catch {
    redisStatus = "down";
  }

  const isHealthy = db.status === "up" && redisStatus === "up";

  return Response.json(
    {
      status: isHealthy ? "ok" : "degraded",
      services: {
        db,
        redis: redisStatus,
        api: "ok",
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    { status: isHealthy ? 200 : 503 },
  );
}
