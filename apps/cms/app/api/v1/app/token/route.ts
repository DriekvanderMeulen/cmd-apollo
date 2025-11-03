// app/api/v1/app/token/route.ts
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

import { db } from "@/db";
import { appCodes } from "@/db/schema/appCodes";
import { lucia } from "@/server/auth";

type TokenRequestBody = { code: string };
type TokenResponseBody = { accessToken: string; expiresIn?: number };

function json<T>(body: T, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request): Promise<Response> {
  const { code } = (await req.json()) as TokenRequestBody;
  if (!code) return json({ error: "Missing code" }, 400);

  const now = new Date();
  const row = await db.query.appCodes.findFirst({
    where: and(eq(appCodes.code, code), gt(appCodes.expiresAt, now)),
  });
  if (!row) return json({ error: "Invalid code" }, 400);

  // single use
  await db.delete(appCodes).where(eq(appCodes.code, code));

  // create a Lucia session for the app
  const appSession = await lucia.createSession(row.userId, {});

  // you can add attributes or device info later if needed
  return json<TokenResponseBody>({
    accessToken: appSession.id,
    expiresIn: 60 * 60 * 24 * 7,
  });
}

// simple CORS for device calls during dev
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}
