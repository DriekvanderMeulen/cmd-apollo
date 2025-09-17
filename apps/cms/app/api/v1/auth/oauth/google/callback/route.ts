import { Google } from "arctic";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { parseJWT } from "oslo/jwt";
import { NextRequest } from "next/server";

import { db, oAuthAccountsTable, tenantTable, userTable } from "@/db";
import { lucia } from "@/server/auth";

interface GoogleClaims {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  at_hash?: string;
  azp?: string;
  email: string;
  email_verified: boolean;
  name: string;
  family_name: string;
  given_name: string;
  hd?: string;
  nonce?: string;
  picture: string;
  locale: string;
  profile: string;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookieStore = await cookies();

    const storedState = cookieStore.get("google_oauth_state")?.value;
    const storedCodeVerifier = cookieStore.get(
      "google_oauth_code_verifier",
    )?.value;

    if (!code || !storedState || !storedCodeVerifier || state !== storedState) {
      return new Response("Invalid request", { status: 400 });
    }

    const baseUrl = process.env.VERCEL
      ? "https://cms.apolloview.app"
      : "http://localhost:3000";

    const google = new Google(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      `${baseUrl}/api/v1/auth/oauth/google/callback`,
    );

    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );

    if (!tokens) {
      return new Response("Invalid request", { status: 400 });
    }

    const idToken = parseJWT(tokens.idToken())?.payload as GoogleClaims;

    if (!idToken) {
      return new Response("Invalid request", { status: 400 });
    }

    // Check if user already exists and get the id
    const existingUser = await db
      .select()
      .from(oAuthAccountsTable)
      .where(eq(oAuthAccountsTable.providerAccountId, idToken.sub))
      .rightJoin(userTable, eq(oAuthAccountsTable.userId, userTable.id));

    if (existingUser[0]) {
      // update tokens
      await db
        .update(oAuthAccountsTable)
        .set({
          expiresAt: tokens.accessTokenExpiresAt(),
          accessToken: tokens.accessToken(),
        })
        .where(eq(oAuthAccountsTable.providerAccountId, idToken.sub));

      const session = await lucia.createSession(existingUser[0].users.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);

      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    // Store user data in cookies for tenant selection
    const pendingUserData = {
      email: idToken.email,
      givenName: idToken.given_name,
      familyName: idToken.family_name,
      pictureUrl: idToken.picture,
      providerAccountId: idToken.sub,
      expiresAt: tokens.accessTokenExpiresAt()?.getTime(),
      accessToken: tokens.accessToken(),
      idToken: tokens.idToken(),
    };

    cookieStore.set("pending_user_data", JSON.stringify(pendingUserData), {
      secure: process.env.NODE_ENV === "production",
      path: "/",
      httpOnly: true,
      maxAge: 60 * 30, // 30 minutes
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/select-tenant",
      },
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
