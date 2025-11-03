import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import path from "path";

// Load environment variables from .env
config({ path: path.join(__dirname, ".env") });

const nodeEnv = process.env.NODE_ENV;
const prodUrl =
  process.env.DATABASE_URL ||
  process.env.RAILWAY_DB_URL ||
  process.env.POSTGRES_URL;

const host = process.env.DATABASE_HOST;
const user = process.env.DATABASE_USER;
const database = process.env.DATABASE_NAME;
const password = process.env.DATABASE_PASSWORD;
const port = process.env.DATABASE_PORT;

type UrlCredentials = { url: string };
type HostCredentials = {
  host: string;
  database: string;
  user?: string;
  password?: string;
  port?: number;
};

let dbCredentials: UrlCredentials | HostCredentials;

if (nodeEnv === "production") {
  if (!prodUrl) {
    console.warn("DATABASE_URL not available during build, using fallback");
    // Use a default URL for build time, will be replaced at runtime
    dbCredentials = { url: "postgresql://user:pass@localhost:5432/db" };
  } else {
    dbCredentials = { url: prodUrl };
  }
} else {
  if (!host || !user || !database) {
    console.warn(
      "Database credentials not available during build, using fallbacks",
    );
    // Use fallback credentials for build time
    dbCredentials = {
      host: host || "localhost",
      user: user || "root",
      database: database || "apollo",
      password,
      port: port ? Number(port) : undefined,
    };
  } else {
    dbCredentials = {
      host,
      user,
      database,
      password,
      port: port ? Number(port) : undefined,
    };
  }
}

export default defineConfig({
  schema: "./db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials,
  verbose: true,
  strict: true,
});
