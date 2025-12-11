// app/api/v1/auth/oauth/google/start/route.ts
import { cookies, headers } from "next/headers";
import { Google } from "arctic";
import { generateCodeVerifier, generateState } from "arctic";

async function getOrigin(): Promise<string> {
  const hdrs = await headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const host =
    hdrs.get("x-forwarded-host") ??
    hdrs.get("host") ??
    (process.env.VERCEL ? "cms.apolloview.app" : "localhost:3000");
  return `${proto}://${host}`;
}

export async function GET(): Promise<Response> {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  // five minutes should be enough
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    domain: isProd ? ".apolloview.app" : undefined,
    maxAge: 60 * 5,
  });
  cookieStore.set("google_oauth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    domain: isProd ? ".apolloview.app" : undefined,
    maxAge: 60 * 5,
  });

  const baseUrl = await getOrigin();
  const google = new Google(
    process.env.GOOGLE_CLIENT_ID as string,
    process.env.GOOGLE_CLIENT_SECRET as string,
    `${baseUrl}/api/v1/auth/oauth/google/callback`,
  );

  // request only what you need
  const authUrl = await google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "email",
    "profile",
  ]);

  return Response.redirect(authUrl.toString(), 302);
}
