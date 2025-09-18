import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"

import { db, oAuthAccountsTable, tenantTable, userTable } from "@/db"
import { lucia } from "@/server/auth"

export async function POST(req: NextRequest) {
	try {
		const { tenantId } = await req.json()
		const cookieStore = await cookies()

		if (!tenantId) {
			return new Response("Invalid request", { status: 400 })
		}

		const pendingUserDataCookie = cookieStore.get("pending_user_data")
		if (!pendingUserDataCookie) {
			return new Response("No pending registration", { status: 400 })
		}

		const pending = JSON.parse(pendingUserDataCookie.value)

		// verify tenant exists
		const tenant = await db
			.select({ id: tenantTable.id })
			.from(tenantTable)
			.where(eq(tenantTable.id, Number(tenantId)))
		if (!tenant[0]) return new Response("Invalid tenant", { status: 400 })

		// create user and oauth account in transaction
		const userId = await db.transaction(async (tx) => {
			await tx.insert(userTable).values({
				email: pending.email,
				givenName: pending.givenName,
				familyName: pending.familyName,
				tenantId: Number(tenantId),
				pictureUrl: pending.pictureUrl,
				emailVerified: true,
			})

			const user = await tx
				.select({ id: userTable.id })
				.from(userTable)
				.where(eq(userTable.email, pending.email))

			await tx.insert(oAuthAccountsTable).values({
				userId: user[0].id,
				provider: "GOOGLE",
				providerAccountId: pending.providerAccountId,
				expiresAt: pending.expiresAt ? new Date(pending.expiresAt) : null,
				accessToken: pending.accessToken,
				idToken: pending.idToken,
			})

			return user[0].id
		})

		const session = await lucia.createSession(userId, {})
		const sessionCookie = lucia.createSessionCookie(session.id)
		cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
		cookieStore.delete("pending_user_data")

		return Response.json({ status: "ok" })
	} catch (err) {
		console.error("mobile complete error", err)
		return new Response("Internal server error", { status: 500 })
	}
}


