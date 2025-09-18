"use server"

import { revalidatePath } from "next/cache"
import { eq, and, ne, like, desc, asc, or, count } from "drizzle-orm"

import { db } from "@/db"
import { userTable, sessionTable } from "@/db/schema"
import { validateRequest } from "@/server/auth/validate"
import { lucia } from "@/server/auth"

interface ActionResult {
	error: string | null
	success?: boolean
}

export interface UserWithSessionCount {
	id: number
	publicId: string
	email: string
	givenName: string | null
	familyName: string | null
	role: "ADMIN" | "EDITOR" | "USER"
	pictureUrl: string | null
	emailVerified: boolean | null
	sessionCount: number
}

export async function getAllUsers(
  searchTerm?: string,
  sortBy?: "name" | "email" | "role",
  sortOrder?: "asc" | "desc",
  roleFilter?: "ADMIN" | "EDITOR" | "USER",
  page: number = 1,
  pageSize: number = 10,
): Promise<UserWithSessionCount[]> {
	const { user } = await validateRequest()
	
	if (!user) {
		throw new Error("Unauthorized: Authentication required")
	}

	// Get the full user data including role from database
	const currentUser = await db
		.select({ role: userTable.role })
		.from(userTable)
		.where(eq(userTable.id, user.id))
		.limit(1)

	if (!currentUser.length || currentUser[0].role !== "ADMIN") {
		throw new Error("Unauthorized: Admin access required")
	}

	// Build where conditions
	const whereConditions: any[] = []

	// Apply search filter
	if (searchTerm && searchTerm.trim()) {
		const searchPattern = `%${searchTerm.trim()}%`
		whereConditions.push(
			// @ts-ignore - Drizzle ORM type complexity
			or(
				like(userTable.email, searchPattern),
				like(userTable.givenName, searchPattern),
				like(userTable.familyName, searchPattern)
			)
		)
	}

	// Apply role filter
	if (roleFilter) {
		// @ts-ignore - Drizzle ORM type complexity
		whereConditions.push(eq(userTable.role, roleFilter))
	}

	// Build order by conditions
	let orderBy: any[] = []
	if (sortBy && sortOrder) {
		const order = sortOrder === "desc" ? desc : asc
		switch (sortBy) {
			case "name":
				// @ts-ignore - Drizzle ORM type complexity
				orderBy = [order(userTable.givenName), order(userTable.familyName)]
				break
			case "email":
				// @ts-ignore - Drizzle ORM type complexity
				orderBy = [order(userTable.email)]
				break
			case "role":
				// @ts-ignore - Drizzle ORM type complexity
				orderBy = [order(userTable.role)]
				break
		}
	} else {
		// @ts-ignore - Drizzle ORM type complexity
		orderBy = [asc(userTable.givenName), asc(userTable.familyName)]
	}

    // Execute query
    const offset = Math.max(0, (page - 1) * pageSize)
    let queryBuilder = db
		.select({
			id: userTable.id,
			publicId: userTable.publicId,
			email: userTable.email,
			givenName: userTable.givenName,
			familyName: userTable.familyName,
			role: userTable.role,
			pictureUrl: userTable.pictureUrl,
			emailVerified: userTable.emailVerified,
		})
		.from(userTable)

	if (whereConditions.length > 0) {
		// @ts-ignore - Drizzle ORM type complexity
		queryBuilder = queryBuilder.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
	}

    // @ts-ignore - Drizzle ORM type complexity
    const users = await queryBuilder.orderBy(...orderBy).limit(pageSize).offset(offset)

	// Get session counts for each user
	const usersWithSessionCount = await Promise.all(
		users.map(async (user) => {
			const sessionCount = await db
				.select({ count: count() })
				.from(sessionTable)
				.where(eq(sessionTable.userId, user.id))

			return {
				...user,
				role: user.role as "ADMIN" | "EDITOR" | "USER",
				sessionCount: sessionCount[0]?.count || 0,
			}
		})
	)

	return usersWithSessionCount
}

export async function updateUserRole(userId: number, newRole: "ADMIN" | "EDITOR" | "USER"): Promise<ActionResult> {
	const { user } = await validateRequest()
	
	if (!user) {
		return { error: "Unauthorized: Authentication required" }
	}

	// Get the full user data including role from database
	const currentUser = await db
		.select({ role: userTable.role })
		.from(userTable)
		.where(eq(userTable.id, user.id))
		.limit(1)

	if (!currentUser.length || currentUser[0].role !== "ADMIN") {
		return { error: "Unauthorized: Admin access required" }
	}

	try {
		// Check if target user is an admin
		const targetUser = await db
			.select({ role: userTable.role })
			.from(userTable)
			.where(eq(userTable.id, userId))
			.limit(1)

		if (!targetUser.length) {
			return { error: "User not found" }
		}

		if (targetUser[0].role === "ADMIN") {
			return { error: "Cannot modify admin users" }
		}

		// Update the user role
		await db
			.update(userTable)
			.set({ role: newRole })
			.where(eq(userTable.id, userId))

		revalidatePath("/admin/users")
		return { error: null, success: true }
	} catch (error) {
		console.error("Error updating user role:", error)
		return { error: "Failed to update user role" }
	}
}

export async function deleteUser(userId: number): Promise<ActionResult> {
	const { user } = await validateRequest()
	
	if (!user) {
		return { error: "Unauthorized: Authentication required" }
	}

	// Get the full user data including role from database
	const currentUser = await db
		.select({ role: userTable.role })
		.from(userTable)
		.where(eq(userTable.id, user.id))
		.limit(1)

	if (!currentUser.length || currentUser[0].role !== "ADMIN") {
		return { error: "Unauthorized: Admin access required" }
	}

	try {
		// Check if target user is an admin
		const targetUser = await db
			.select({ role: userTable.role })
			.from(userTable)
			.where(eq(userTable.id, userId))
			.limit(1)

		if (!targetUser.length) {
			return { error: "User not found" }
		}

		if (targetUser[0].role === "ADMIN") {
			return { error: "Cannot delete admin users" }
		}

		// Delete the user (cascade will handle sessions and oauth accounts)
		await db
			.delete(userTable)
			.where(eq(userTable.id, userId))

		revalidatePath("/admin/users")
		return { error: null, success: true }
	} catch (error) {
		console.error("Error deleting user:", error)
		return { error: "Failed to delete user" }
	}
}

export async function suspendUserSessions(userId: number): Promise<ActionResult> {
	const { user } = await validateRequest()
	
	if (!user) {
		return { error: "Unauthorized: Authentication required" }
	}

	// Get the full user data including role from database
	const currentUser = await db
		.select({ role: userTable.role })
		.from(userTable)
		.where(eq(userTable.id, user.id))
		.limit(1)

	if (!currentUser.length || currentUser[0].role !== "ADMIN") {
		return { error: "Unauthorized: Admin access required" }
	}

	try {
		// Check if target user is an admin
		const targetUser = await db
			.select({ role: userTable.role })
			.from(userTable)
			.where(eq(userTable.id, userId))
			.limit(1)

		if (!targetUser.length) {
			return { error: "User not found" }
		}

		if (targetUser[0].role === "ADMIN") {
			return { error: "Cannot suspend admin user sessions" }
		}

		// Get all sessions for the user and invalidate them
		const sessions = await db
			.select({ id: sessionTable.id })
			.from(sessionTable)
			.where(eq(sessionTable.userId, userId))

		for (const session of sessions) {
			await lucia.invalidateSession(session.id)
		}

		revalidatePath("/admin/users")
		return { error: null, success: true }
	} catch (error) {
		console.error("Error suspending user sessions:", error)
		return { error: "Failed to suspend user sessions" }
	}
}
