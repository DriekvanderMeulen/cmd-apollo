import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  CF_R2_ACCOUNT_ID: z.string(),
  CF_R2_BUCKET: z.enum(["apollo-dev", "apollo-prod"]),
  CF_R2_SECRET_ACCESS_KEY: z.string(),
  CF_R2_ACCESS_KEY_ID: z.string(),
  CF_R2_S3_ENDPOINT: z.string().endsWith("r2.cloudflarestorage.com"),
  AUTH_STRING: z.string(),
  APP_BEARER_TOKEN: z.string().min(1, "APP_BEARER_TOKEN is required"),
  DATABASE_HOST: z.string().optional(),
  DATABASE_USER: z.string().optional(),
  DATABASE_NAME: z.enum(["apollo"]).optional(),
  GOOGLE_CLIENT_ID: z.string().endsWith("apps.googleusercontent.com"),
  GOOGLE_CLIENT_SECRET: z.string(),
  DATABASE_URL: z
    .string()
    .startsWith("postgresql://postgres:")
    .endsWith(".proxy.rlwy.net:34523/railway"),
  QR_TOKEN_SECRET: z.string().min(1, "QR_TOKEN_SECRET is required"),
  APP_PUBLIC_URL: z.string().url("APP_PUBLIC_URL must be a valid URL"),
});

let cachedEnv: z.infer<typeof EnvSchema> | null = null;

function getEnv() {
  // Skip validation during build (when Vercel builds, env vars might not be available)
  // Only validate at runtime
  if (process.env.NEXT_PHASE === "phase-production-build") {
    // Return a mock object during build - will be validated at runtime
    return {
      NODE_ENV: "production" as const,
      CF_R2_ACCOUNT_ID: "",
      CF_R2_BUCKET: "apollo-prod" as const,
      CF_R2_SECRET_ACCESS_KEY: "",
      CF_R2_ACCESS_KEY_ID: "",
      CF_R2_S3_ENDPOINT: "https://placeholder.r2.cloudflarestorage.com",
      AUTH_STRING: "",
      APP_BEARER_TOKEN: "",
      DATABASE_HOST: undefined,
      DATABASE_USER: undefined,
      DATABASE_NAME: undefined,
      GOOGLE_CLIENT_ID: "placeholder.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "",
      DATABASE_URL: "postgresql://postgres:placeholder@placeholder.proxy.rlwy.net:34523/railway",
      QR_TOKEN_SECRET: "",
      APP_PUBLIC_URL: "https://app.apolloview.app",
    } as z.infer<typeof EnvSchema>;
  }

  if (cachedEnv) {
    return cachedEnv;
  }

  const envVars = process.env;
  const parsedEnv = EnvSchema.safeParse(envVars);

  if (!parsedEnv.success) {
    throw new Error(
      "Invalid env provided. The following variables are missing or invalid:" +
        Object.entries(parsedEnv.error.flatten().fieldErrors)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join("\n"),
    );
  }

  cachedEnv = parsedEnv.data;
  return cachedEnv;
}

export const env = new Proxy({} as z.infer<typeof EnvSchema>, {
  get(_target, prop) {
    return getEnv()[prop as keyof z.infer<typeof EnvSchema>];
  },
});
