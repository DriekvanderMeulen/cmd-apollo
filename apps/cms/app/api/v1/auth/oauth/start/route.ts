// app/api/v1/app/oauth/start/route.ts
import { cookies } from "next/headers";

function badRequest(message: string): Response {
  return new Response(message, { status: 400 });
}

function getBaseUrl(): string {
  const isVercel = Boolean(process.env.VERCEL);
  return isVercel ? "https://cms.apolloview.app" : "http://localhost:3000";
}

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const appRedirect = searchParams.get("redirect_uri");
  if (!appRedirect) return badRequest("Missing redirect_uri");

  const cookieStore = await cookies();
  cookieStore.set("app_redirect", appRedirect, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 5,
  });

  // forward into your normal Google start
  const baseUrl = getBaseUrl();
  return Response.redirect(`${baseUrl}/api/v1/auth/oauth/google/start`, 302);
}
