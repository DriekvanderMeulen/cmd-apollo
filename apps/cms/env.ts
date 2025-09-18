import { z } from "zod";

const createEnv = () => {
  const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]),
    CF_R2_ACCOUNT_ID: z.string(),
    CF_R2_BUCKET: z.string(),
    CF_R2_SECRET_ACCESS_KEY: z.string(),
    CF_R2_ACCESS_KEY_ID: z.string(),
    CF_R2_S3_ENDPOINT: z.string(),
    DATABASE_HOST: z.string(),
    DATABASE_USER: z.string(),
    DATABASE_NAME: z.string(),
    DATABASE_PORT: z.string().optional(),
    DATABASE_PASSWORD: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    VERCEL: z.string().optional(),
    MYSQL_PUBLIC_URL: z.string().optional(),
    AUTH_STRING: z.string(),
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
