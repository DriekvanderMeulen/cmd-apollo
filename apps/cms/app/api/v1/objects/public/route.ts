import { and, asc, count, desc, eq, inArray, like } from 'drizzle-orm'
import { createHash } from 'crypto'
import { db, objectTable, userTable, collectionTable, categoryTable } from '@/db'
import { requireBearerToken } from '@/lib/bearerAuth'

function generateETag(data: unknown): string {
	const jsonString = JSON.stringify(data)
	const hash = createHash('sha256').update(jsonString).digest('hex')
	return `"${hash}"`
}

export async function GET(req: Request): Promise<Response> {
	try {
		requireBearerToken(req)
	} catch (error) {
		if (error instanceof Response) {
			return error
		}
		return new Response('Unauthorized', { status: 401 })
	}

	const url = new URL(req.url)
	const page = Math.max(1, Number(url.searchParams.get('page') || 1))
	const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') || 10)))
	const sortParam = (url.searchParams.get('sort') || 'id:desc').toLowerCase()
	const search = url.searchParams.get('search') || ''
	const filterParam = url.searchParams.get('filter') || ''

	const offset = (page - 1) * pageSize

	// Parse sort parameter
	const [sortField, sortDirection] = sortParam.split(':')
	const orderBy =
		sortField === 'title'
			? sortDirection === 'asc'
				? asc(objectTable.title)
				: desc(objectTable.title)
			: sortField === 'id'
				? sortDirection === 'asc'
					? asc(objectTable.id)
					: desc(objectTable.id)
				: desc(objectTable.id)

	// Build where conditions
	const wheres: Array<ReturnType<typeof and>> = []
	wheres.push(eq(objectTable.public, true)) // Only public items

	if (search) {
		wheres.push(like(objectTable.title, `%${search}%`))
	}

	// Parse filter parameter (e.g., "collectionId:1,2,3&categoryId:4,5")
	// Format: collectionId:1,2,3&categoryId:4,5 (using & to separate filter groups)
	if (filterParam) {
		const filterGroups = filterParam.split('&')
		for (const group of filterGroups) {
			const [key, valuesStr] = group.split(':')
			if (!valuesStr) continue

			const values = valuesStr
				.split(',')
				.map((v) => Number(v.trim()))
				.filter((v) => !isNaN(v) && v > 0)

			if (values.length === 0) continue

			if (key === 'categoryId') {
				if (values.length === 1) {
					wheres.push(eq(objectTable.categoryId, values[0]))
				} else {
					wheres.push(inArray(objectTable.categoryId, values))
				}
			}
			if (key === 'collectionId') {
				if (values.length === 1) {
					wheres.push(eq(objectTable.collectionId, values[0]))
				} else {
					wheres.push(inArray(objectTable.collectionId, values))
				}
			}
		}
	}

	const where = wheres.length > 0 ? and(...wheres) : undefined

	// Fetch data and count
	const [rows, totalRows] = await Promise.all([
		db
			.select({
				id: objectTable.id,
				publicId: objectTable.publicId,
				title: objectTable.title,
				description: objectTable.description,
				collectionId: objectTable.collectionId,
				categoryId: objectTable.categoryId,
				cfR2Link: objectTable.cfR2Link,
				userId: objectTable.userId,
				userPublicId: userTable.publicId,
				userGivenName: userTable.givenName,
				userFamilyName: userTable.familyName,
				userEmail: userTable.email,
				collectionTitle: collectionTable.title,
				collectionPublicId: collectionTable.publicId,
				categoryTitle: categoryTable.title,
				categoryPublicId: categoryTable.publicId,
			})
			.from(objectTable)
			.leftJoin(userTable, eq(userTable.id, objectTable.userId))
			.leftJoin(collectionTable, eq(collectionTable.id, objectTable.collectionId))
			.leftJoin(categoryTable, eq(categoryTable.id, objectTable.categoryId))
			.where(where as any)
			.orderBy(orderBy as any)
			.limit(pageSize)
			.offset(offset),
		db.select({ value: count() }).from(objectTable).where(where as any),
	])

	const total = totalRows[0]?.value || 0

	// Transform rows to response format
	const items = rows.map((row) => ({
		publicId: row.publicId,
		title: row.title,
		description: row.description,
		user: {
			id: row.userId,
			publicId: row.userPublicId,
			givenName: row.userGivenName,
			familyName: row.userFamilyName,
			email: row.userEmail,
		},
		collection: {
			id: row.collectionId,
			publicId: row.collectionPublicId,
			title: row.collectionTitle,
		},
		category: row.categoryId
			? {
					id: row.categoryId,
					publicId: row.categoryPublicId,
					title: row.categoryTitle,
				}
			: null,
		posterUrl: row.cfR2Link || null,
	}))

	// Generate version from query params and total count for stable caching
	const versionInput = `${page}-${pageSize}-${sortParam}-${search}-${filterParam}-${total}`
	const version = createHash('sha256').update(versionInput).digest('hex').substring(0, 16)

	const response = {
		items,
		total,
		page,
		pageSize,
		version,
	}

	const etag = generateETag(response)

	return Response.json(response, {
		headers: {
			ETag: etag,
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Authorization, Content-Type',
		},
	})
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, {
		status: 204,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Authorization, Content-Type',
		},
	})
}

