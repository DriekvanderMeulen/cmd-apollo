import { NextRequest } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

type HealthStatus = "ok" | "degraded" | "error" | "not_configured";

interface HealthResponse {
  status: HealthStatus;
  checks: Record<
    string,
    { status: HealthStatus; details?: Record<string, unknown> }
  >;
}

export async function GET(_req: NextRequest) {
  const checks: HealthResponse["checks"] = {};

  // Database connectivity check
  try {
    // Check for DATABASE_URL first (production or development with URL)
    const urlValue =
      process.env.DATABASE_URL ||
      process.env.RAILWAY_DB_URL ||
      process.env.POSTGRES_URL;
    
    if (urlValue) {
      const connection = postgres(urlValue, {
        ssl: process.env.NODE_ENV === "production" ? "require" : false,
        max: 1,
      });
      await connection`SELECT 1`;
      await connection.end();
      checks["db:url"] = { status: "ok" };
    } else {
      // Fallback to local database credentials
      const host = process.env.DATABASE_HOST;
      const user = process.env.DATABASE_USER;
      const database = process.env.DATABASE_NAME;
      const password = process.env.DATABASE_PASSWORD;
      const port = process.env.DATABASE_PORT;

      if (!host || !user || !database) {
        checks["db:local"] = { status: "not_configured" };
      } else {
        const connectionString = `postgresql://${user}:${password}@${host}:${port || 5432}/${database}`;
        const connection = postgres(connectionString, { max: 1 });
        await connection`SELECT 1`;
        await connection.end();
        checks["db:local"] = { status: "ok" };
      }
    }
  } catch (error) {
    checks["db"] = { status: "error", details: { error: String(error) } };
  }

  const overall: HealthStatus = Object.values(checks).some(
    (c) => c.status === "error",
  )
    ? "error"
    : Object.values(checks).some(
          (c) => c.status === "degraded" || c.status === "not_configured",
        )
      ? "degraded"
      : "ok";

  const body: HealthResponse = { status: overall, checks };

  return Response.json(body, {
    status: overall === "error" ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
