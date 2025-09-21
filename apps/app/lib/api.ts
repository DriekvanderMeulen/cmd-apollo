import { getAccessToken, getCmsOrigin } from '@/lib/auth'

export type ApiListResponse<T> = {
	data: Array<T>
	nextCursor?: string | null
}

export type AppObject = {
	id: number
	publicId: string
	title: string
	categoryId: number | null
	collectionId: number | null
    cfR2Link?: string | null
	tenantId?: number | null
	username?: string | null
	updatedAt: string
}

export type Category = { id: number; publicId: string; title: string }
export type Collection = { id: number; publicId: string; title: string }
export type Tenant = { id: number; publicId: string; title?: string; name?: string }

type ObjectsQuery = {
	categoryId?: number | null
	collectionId?: number | null
	search?: string | null
	cursor?: string | null
	limit?: number | null
	// Not documented, but included for forward-compat if backend supports it later
	tenantId?: number | null
}

function toParams(params: Record<string, unknown | null | undefined>): string {
	const searchParams = new URLSearchParams()
	Object.entries(params).forEach(([key, value]) => {
		if (value === null || value === undefined || value === '') return
		searchParams.set(key, String(value))
	})
	const s = searchParams.toString()
	return s.length > 0 ? `?${s}` : ''
}

async function authorizedFetch(path: string): Promise<Response> {
	const base = getCmsOrigin()
	const token = await getAccessToken()
	if (!token) throw new Error('Missing access token')
	return fetch(`${base}${path}`, {
		headers: {
			accept: 'application/json',
			authorization: `Bearer ${token}`,
		},
	})
}

const APP_API_BASE = '/api/v1/app'

export async function fetchObjects(query: ObjectsQuery = {}): Promise<ApiListResponse<AppObject>> {
	const qs = toParams({
		categoryId: query.categoryId,
		collectionId: query.collectionId,
		search: query.search,
		cursor: query.cursor,
		limit: query.limit ?? 50,
		// Tentative: include tenantId if provided, ignored by server if unsupported
		tenantId: query.tenantId,
	})
	const res = await authorizedFetch(`${APP_API_BASE}/objects${qs}`)
	if (!res.ok) throw new Error('Failed to load objects')
	return res.json() as Promise<ApiListResponse<AppObject>>
}

export async function fetchCategories(): Promise<Array<Category>> {
	const res = await authorizedFetch(`${APP_API_BASE}/categories`)
	if (!res.ok) throw new Error('Failed to load categories')
	const json = (await res.json()) as { data: Array<Category> }
	return json.data
}

export async function fetchCollections(): Promise<Array<Collection>> {
	const res = await authorizedFetch(`${APP_API_BASE}/collections`)
	if (!res.ok) throw new Error('Failed to load collections')
	const json = (await res.json()) as { data: Array<Collection> }
	return json.data
}

export async function fetchTenants(): Promise<Array<Tenant>> {
	// Some environments may expose title vs name; normalize later when displaying
	const res = await authorizedFetch(`${APP_API_BASE}/tenants`)
	if (!res.ok) throw new Error('Failed to load tenants')
	const json = (await res.json()) as { data: Array<Tenant> }
	return json.data
}

export type R2ObjectSummary = {
    key: string
    size: number | null
    etag: string | null
    lastModified: string | null
}

export async function listR2(prefix: string): Promise<Array<R2ObjectSummary>> {
    const res = await authorizedFetch(`${APP_API_BASE}/r2/list?prefix=${encodeURIComponent(prefix)}`)
    if (!res.ok) throw new Error('Failed to list R2 objects')
    const json = (await res.json()) as { data: Array<R2ObjectSummary> }
    return json.data
}

export async function getR2ObjectBlob(key: string): Promise<Blob> {
    const base = getCmsOrigin()
    const token = await getAccessToken()
    if (!token) throw new Error('Missing access token')
    const res = await fetch(`${base}${APP_API_BASE}/r2/object?key=${encodeURIComponent(key)}`, {
        headers: {
            authorization: `Bearer ${token}`,
        },
    })
    if (!res.ok) throw new Error('Failed to download R2 object')
    return await res.blob()
}


