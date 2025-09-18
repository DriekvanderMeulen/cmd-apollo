import { NextRequest } from "next/server"
import mysql from "mysql2/promise"

export const dynamic = "force-dynamic"

type HealthStatus = "ok" | "degraded" | "error" | "not_configured"

interface HealthResponse {
	status: HealthStatus
	checks: Record<string, { status: HealthStatus; details?: Record<string, unknown> }>
}

export async function GET(_req: NextRequest) {
	const checks: HealthResponse["checks"] = {}

    // Database connectivity check based on environment
    try {
        const isProd = process.env.NODE_ENV === "production"
        if (isProd) {
            const urlValue = process.env.MYSQL_PUBLIC_URL || process.env.RAILWAY_DB_URL || process.env.DATABASE_URL
            if (!urlValue) {
                checks["db:url"] = { status: "not_configured" }
            } else {
                const url = new URL(urlValue)
                const connection = await mysql.createConnection({
                    host: url.hostname,
                    port: Number(url.port) || 3306,
                    user: decodeURIComponent(url.username),
                    password: decodeURIComponent(url.password),
                    database: url.pathname.replace(/^\//, ""),
                    ssl: { rejectUnauthorized: false },
                })
                await connection.execute("SELECT 1")
                await connection.end()
                checks["db:url"] = { status: "ok" }
            }
        } else {
            const host = process.env.DATABASE_HOST
            const user = process.env.DATABASE_USER
            const database = process.env.DATABASE_NAME
            const password = process.env.DATABASE_PASSWORD
            const port = process.env.DATABASE_PORT

            if (!host || !user || !database) {
                checks["db:local"] = { status: "not_configured" }
            } else {
                const connection = await mysql.createConnection({
                    host,
                    port: port ? Number(port) : 3306,
                    user,
                    password,
                    database,
                })
                await connection.execute("SELECT 1")
                await connection.end()
                checks["db:local"] = { status: "ok" }
            }
        }
    } catch (error) {
        checks["db"] = { status: "error", details: { error: String(error) } }
    }

	const overall: HealthStatus = Object.values(checks).some((c) => c.status === "error")
		? "error"
		: Object.values(checks).some((c) => c.status === "degraded" || c.status === "not_configured")
		? "degraded"
		: "ok"

	const body: HealthResponse = { status: overall, checks }

	return Response.json(body, {
		status: overall === "error" ? 503 : 200,
		headers: { "Cache-Control": "no-store" },
	})
}


