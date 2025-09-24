import { env } from "@/env"
import { S3Client } from "@aws-sdk/client-s3"

// Cloudflare R2 is S3-compatible. We use the S3 client pointed at R2 endpoint.
export function createR2Client(): S3Client {
  const accountId = env.CF_R2_ACCOUNT_ID
  const endpoint = env.CF_R2_S3_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`
  // Basic sanity check to help catch swapped keys (do not log secrets)
  const accessKeyId = env.CF_R2_ACCESS_KEY_ID
  const secretAccessKey = env.CF_R2_SECRET_ACCESS_KEY
  if (accessKeyId.length > 40 || secretAccessKey.length < 40) {
    throw new Error(
      "Invalid R2 credentials: access key id appears too long or secret too short. Ensure CF_R2_ACCESS_KEY_ID is the short Access Key ID and CF_R2_SECRET_ACCESS_KEY is the long Secret Key."
    )
  }
  return new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

function normalizeBucket(input: string): string {
  try {
    // If it's a full URL, take the pathname (last segment)
    if (input.startsWith("http://") || input.startsWith("https://")) {
      const url = new URL(input)
      const path = url.pathname.replace(/^\/+|\/+$/g, "")
      if (path) return path.split("/").pop() as string
    }
    // If it contains slashes, take the last segment
    if (input.includes("/")) return input.split("/").filter(Boolean).pop() as string
    return input
  } catch {
    return input
  }
}

export const R2_BUCKET_NAME = normalizeBucket(env.CF_R2_BUCKET)
export const R2_BUCKET = R2_BUCKET_NAME


