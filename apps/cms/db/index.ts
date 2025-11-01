import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// Check if we have a Railway URL (production)
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.RAILWAY_DB_URL ||
  process.env.POSTGRES_URL;

let connectionString: string;

if (databaseUrl) {
  connectionString = databaseUrl;
} else {
  // Fallback to individual environment variables for development
  const host = process.env.DATABASE_HOST || "localhost";
  const user = process.env.DATABASE_USER || "postgres";
  const database = process.env.DATABASE_NAME || "apollo";
  const password = process.env.DATABASE_PASSWORD || "";
  const port = process.env.DATABASE_PORT || "5432";

  connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
  max: 10,
});

export const db = drizzle(client, { schema });

export * from "./schema";
export * from "./id";
