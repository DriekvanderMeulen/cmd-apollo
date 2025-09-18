"use server"

import { and, asc, count, desc, eq, like } from "drizzle-orm"

import { db } from "@/db"
import { categoryTable, collectionTable, tenantTable } from "@/db/schema"
import { validateRequest } from "@/server/auth/validate"

interface Paginated<T> { items: Array<T>; total: number }
interface ListParams { page?: number; pageSize?: number; q?: string }

function requireEditorOrAdmin(role: "ADMIN" | "EDITOR" | "USER") {
	if (role !== "ADMIN" && role !== "EDITOR") {
		throw new Error("Unauthorized: Editor or Admin required")
	}
}

export async function listCategories(params: ListParams): Promise<Paginated<{ id: number; publicId: string; title: string }>> {
	const { user } = await validateRequest()
	if (!user) throw new Error("Unauthorized")
	requireEditorOrAdmin(user.role as any)
	const page = Math.max(1, params.page || 1)
	const pageSize = Math.min(50, Math.max(1, params.pageSize || 10))
	const offset = (page - 1) * pageSize

	const where = params.q?.trim() ? like(categoryTable.title, `%${params.q.trim()}%`) : undefined

	const [rows, total] = await Promise.all([
		(await (where
			? db.select().from(categoryTable).where(where).orderBy(asc(categoryTable.title)).limit(pageSize).offset(offset)
			: db.select().from(categoryTable).orderBy(asc(categoryTable.title)).limit(pageSize).offset(offset))),
		(await db.select({ value: count() }).from(categoryTable).where(where as any))
	])

	return { items: rows, total: total[0]?.value || 0 }
}

export async function createCategory(input: { title: string }) {
	const { user } = await validateRequest()
	if (!user) throw new Error("Unauthorized")
	requireEditorOrAdmin(user.role as any)
	await db.insert(categoryTable).values({ title: input.title })
}

export async function updateCategory(input: { id: number; title: string }) {
	const { user } = await validateRequest()
	if (!user) throw new Error("Unauthorized")
	requireEditorOrAdmin(user.role as any)
	await db.update(categoryTable).set({ title: input.title }).where(eq(categoryTable.id, input.id))
}

export async function deleteCategory(id: number) {
	const { user } = await validateRequest()
	if (!user) throw new Error("Unauthorized")
	requireEditorOrAdmin(user.role as any)
	await db.delete(categoryTable).where(eq(categoryTable.id, id))
}

export async function listTenants(params: ListParams): Promise<Paginated<{ id: number; publicId: string; name: string }>> {
	const { user } = await validateRequest()
	if (!user) throw new Error("Unauthorized")
	requireEditorOrAdmin(user.role as any)
	const page = Math.max(1, params.page || 1)
	const pageSize = Math.min(50, Math.max(1, params.pageSize || 10))
	const offset = (page - 1) * pageSize

	const where = params.q?.trim() ? like(tenantTable.name, `%${params.q.trim()}%`) : undefined

	const [rows, total] = await Promise.all([
		(await (where
			? db.select().from(tenantTable).where(where).orderBy(asc(tenantTable.name)).limit(pageSize).offset(offset)
			: db.select().from(tenantTable).orderBy(asc(tenantTable.name)).limit(pageSize).offset(offset))),
		(await db.select({ value: count() }).from(tenantTable).where(where as any))
	])

	return { items: rows, total: total[0]?.value || 0 }
}

export async function createTenant(input: { name: string }) {
	const { user } = await validateRequest()
	if (!user) throw new Error("Unauthorized")
	requireEditorOrAdmin(user.role as any)
	await db.insert(tenantTable).values({ name: input.name })
}

export async function updateTenant(input: { id: number; name: string }) {
	const { user } = await validateRequest()
	if (!user) throw new Error("Unauthorized")
	requireEditorOrAdmin(user.role as any)
	await db.update(tenantTable).set({ name: input.name }).where(eq(tenantTable.id, input.id))
}

export async function deleteTenant(id: number) {
	const { user } = await validateRequest()
	if (!user) throw new Error("Unauthorized")
	requireEditorOrAdmin(user.role as any)
	await db.delete(tenantTable).where(eq(tenantTable.id, id))
}

export async function listCollections(params: ListParams): Promise<Paginated<{ id: number; publicId: string; tenantId: number; title: string }>> {
	const { user } = await validateRequest()
	if (!user) throw new Error("Unauthorized")
	requireEditorOrAdmin(user.role as any)
	const page = Math.max(1, params.page || 1)
	const pageSize = Math.min(50, Math.max(1, params.pageSize || 10))
	const offset = (page - 1) * pageSize

	const where = params.q?.trim() ? like(collectionTable.title, `%${params.q.trim()}%`) : undefined

	const [rows, total] = await Promise.all([
		(await (where
			? db.select().from(collectionTable).where(where).orderBy(asc(collectionTable.title)).limit(pageSize).offset(offset)
			: db.select().from(collectionTable).orderBy(asc(collectionTable.title)).limit(pageSize).offset(offset))),
		(await db.select({ value: count() }).from(collectionTable).where(where as any))
	])

	return { items: rows, total: total[0]?.value || 0 }
}

export async function createCollection(input: { tenantId: number; title: string }) {
	const { user } = await validateRequest()
	if (!user) throw new Error("Unauthorized")
	requireEditorOrAdmin(user.role as any)
	await db.insert(collectionTable).values({ tenantId: input.tenantId, title: input.title })
}

export async function updateCollection(input: { id: number; title: string }) {
	const { user } = await validateRequest()
	if (!user) throw new Error("Unauthorized")
	requireEditorOrAdmin(user.role as any)
	await db.update(collectionTable).set({ title: input.title }).where(eq(collectionTable.id, input.id))
}

export async function deleteCollection(id: number) {
	const { user } = await validateRequest()
	if (!user) throw new Error("Unauthorized")
	requireEditorOrAdmin(user.role as any)
	await db.delete(collectionTable).where(eq(collectionTable.id, id))
}


