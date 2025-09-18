import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import { parseJWT } from "oslo/jwt"
import { eq } from "drizzle-orm"

import { db, oAuthAccountsTable, userTable } from "@/db"
import { lucia } from "@/server/auth"

interface GoogleClaims {
	aud: string
	exp: number
	iat: number
	iss: string
	sub: string
	email: string
	email_verified: boolean
	name: string
	family_name: string
	given_name: string
	picture: string
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { idToken, accessToken, accessTokenExpiresAt } = body ?? {}

		if (!idToken || !accessToken) {
			return new Response("Invalid request", { status: 400 })
		}

		const claims = parseJWT(idToken)?.payload as GoogleClaims | null
		if (!claims?.sub || !claims.email) {
			return new Response("Invalid token", { status: 400 })
		}

		// Validate token issuer and audience (ensure it was issued for one of our mobile client IDs)
		const validIssuers = new Set(["https://accounts.google.com", "accounts.google.com"])
		if (!validIssuers.has((claims as any).iss)) {
			return new Response("Invalid token issuer", { status: 401 })
		}
		const allowedAudiences = (process.env.MOBILE_GOOGLE_CLIENT_IDS || "")
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean)
		if (allowedAudiences.length > 0 && !allowedAudiences.includes(claims.aud)) {
			return new Response("Invalid token audience", { status: 401 })
		}

		// Lookup OAuth account by providerAccountId (Google sub)
		const existingUser = await db
			.select()
			.from(oAuthAccountsTable)
			.where(eq(oAuthAccountsTable.providerAccountId, claims.sub))
			.rightJoin(userTable, eq(oAuthAccountsTable.userId, userTable.id))

		const cookieStore = await cookies()

		if (existingUser[0]) {
			// update tokens
			await db
				.update(oAuthAccountsTable)
				.set({
					expiresAt: accessTokenExpiresAt ? new Date(accessTokenExpiresAt) : undefined,
					accessToken,
				})
				.where(eq(oAuthAccountsTable.providerAccountId, claims.sub))

			const session = await lucia.createSession(existingUser[0].users.id, {})
			const sessionCookie = lucia.createSessionCookie(session.id)
			cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

			return Response.json({ status: "ok" })
		}

		// store pending user data for tenant selection
		const pendingUserData = {
			email: claims.email,
			givenName: claims.given_name,
			familyName: claims.family_name,
			pictureUrl: claims.picture,
			providerAccountId: claims.sub,
			expiresAt: accessTokenExpiresAt ?? null,
			accessToken,
			idToken,
		}

		cookieStore.set("pending_user_data", JSON.stringify(pendingUserData), {
			secure: process.env.NODE_ENV === "production",
			path: "/",
			httpOnly: true,
			maxAge: 60 * 30,
		})

		return Response.json({ status: "needsTenant" })
	} catch (err) {
		console.error("mobile verify error", err)
		return new Response("Internal server error", { status: 500 })
	}
}


