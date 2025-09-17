import { defineConfig } from "drizzle-kit";

const host = process.env.DATABASE_HOST;
const user = process.env.DATABASE_USER;
const database = process.env.DATABASE_NAME;
const port = process.env.DATABASE_PORT;

if (!host || !user || !database) {
  throw new Error("Database environment variable is required");
}

export default defineConfig({
  schema: "./db/schema/index.ts",
  dialect: "mysql",
  dbCredentials: {
    host,
    user,
    database,
    port: port ? Number(port) : undefined, // port is only needed when pushing to production
  },
  verbose: true,
  strict: true,
});
