"use server";

import { generateCodeVerifier, generateState } from "arctic";
import { Google } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { tenantTable, userTable, oAuthAccountsTable } from "@/db/schema";
import { lucia } from "@/server/auth";
import { validateRequest } from "@/server/auth/validate";

interface ActionResult { 
  error: string | null;
}

export async function logout(): Promise<ActionResult> {
  const { session } = await validateRequest();
  const cookieStore = await cookies();

  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

export async function signInWithGoogle(): Promise<ActionResult> {
  const cookieStore = await cookies();
  // TODO: Make a request to Google Cloud KMS to get client ID and secret.
  // TODO: fetch the tenant from the database

  const url = process.env.VERCEL
    ? "https://cms.apolloview.app"
    : "http://localhost:3000";

  const google = new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${url}/api/v1/auth/oauth/google/callback`,
  );

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const authorizationURL = google.createAuthorizationURL(state, codeVerifier, [
    "email",
    "profile",
  ]);

  cookieStore.set("google_oauth_state", state, {
    secure: process.env.NODE_ENV === "production",
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 min
  });

  cookieStore.set("google_oauth_code_verifier", codeVerifier, {
    secure: process.env.NODE_ENV === "production",
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 min
  });

  return redirect(authorizationURL.toString());
}

export async function getAvailableTenants() {
  try {
    const tenants = await db
      .select({
        id: tenantTable.id,
        name: tenantTable.name,
      })
      .from(tenantTable)
      .orderBy(tenantTable.name);

    return { tenants, error: null };
  } catch (error) {
    return { tenants: [], error: "Failed to load tenants" };
  }
}

export async function completeTenantRegistration(tenantId: number): Promise<ActionResult> {
  const cookieStore = await cookies();
  
  try {
    // Get pending user data from cookies
    const pendingUserDataCookie = cookieStore.get("pending_user_data");
    
    if (!pendingUserDataCookie) {
      return { error: "No pending registration found. Please try signing in again." };
    }

    const pendingUserData = JSON.parse(pendingUserDataCookie.value);
    
    // Complete the user registration with selected tenant
    const userId = await db.transaction(async (tx) => {
      // Create the user with selected tenant
      await tx.insert(userTable).values({
        email: pendingUserData.email,
        givenName: pendingUserData.givenName,
        familyName: pendingUserData.familyName,
        tenantId: tenantId,
        pictureUrl: pendingUserData.pictureUrl,
        emailVerified: true,
      });

      const user = await tx
        .select({ id: userTable.id })
        .from(userTable)
        .where(eq(userTable.email, pendingUserData.email));

      // Create OAuth account
      await tx.insert(oAuthAccountsTable).values({
        userId: user[0].id,
        provider: "GOOGLE",
        providerAccountId: pendingUserData.providerAccountId,
        expiresAt: new Date(pendingUserData.expiresAt),
        accessToken: pendingUserData.accessToken,
        idToken: pendingUserData.idToken,
      });

      return user[0].id;
    });

    // Create session
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // Clear pending user data
    cookieStore.delete("pending_user_data");

    return { error: null };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to complete registration. Please try again." };
  }
}
