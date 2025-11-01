import { z } from "zod";

const createEnv = () => {
  const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]),
    CF_R2_ACCOUNT_ID: z.string(),
    CF_R2_BUCKET: z.enum(["apollo-dev", "apollo-prod"]),
    CF_R2_SECRET_ACCESS_KEY: z.string(),
    CF_R2_ACCESS_KEY_ID: z.string(),
    CF_R2_S3_ENDPOINT: z.string().endsWith("r2.cloudflarestorage.com"),
    AUTH_STRING: z.string(),
    DATABASE_HOST: z.string().optional(),
    DATABASE_USER: z.string().optional(),
    DATABASE_NAME: z.enum(["apollo"]).optional(),
    GOOGLE_CLIENT_ID: z.string().endsWith("apps.googleusercontent.com"),
    GOOGLE_CLIENT_SECRET: z.string(),
    DATABASE_URL: z
      .string()
      .startsWith("postgresql://postgres:")
      .endsWith(".proxy.rlwy.net:34523/railway"),
  });
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

  return parsedEnv.data;
};

export const env = createEnv();
