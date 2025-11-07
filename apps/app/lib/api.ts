import { BEARER_TOKEN, CMS_API_URL } from '@/constants/config'
import type { ObjectData } from './storage'

export type ObjectDetailIteration = {
	id: number
	title: string
	date: string
	description: string | object | null
}

export type ObjectDetailResponse = {
	publicId: string
	title: string
	description: string | object | null
	user: {
		id: number
		publicId: string | null
		givenName: string | null
		familyName: string | null
		email: string | null
	}
	collection: {
		id: number | null
		publicId: string | null
		title: string | null
	}
	category: {
		id: number
		publicId: string | null
		title: string
	} | null
	posterUrl: string | null
	videoUrl: string | null
	iterations: Array<ObjectDetailIteration>
	version: string
}

export type FetchObjectDetailOptions = {
	ifNoneMatch?: string
}

export type ObjectDetailResult =
	| { data: ObjectDetailResponse; etag: string | null; notModified?: false }
	| { data: null; etag: null; notModified: true }

export async function fetchObjectDetail(
	publicId: string,
	options?: FetchObjectDetailOptions
): Promise<ObjectDetailResult> {
	const url = `${CMS_API_URL}/api/v1/objects/public/${publicId}`

	const headers: Record<string, string> = {
		Authorization: `Bearer ${BEARER_TOKEN}`,
		'Content-Type': 'application/json',
	}

	if (options?.ifNoneMatch) {
		headers['If-None-Match'] = options.ifNoneMatch
	}

	const response = await fetch(url, {
		method: 'GET',
		headers,
	})

	if (response.status === 304) {
		// Not Modified - return special indicator
		return { data: null, etag: null, notModified: true }
	}

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Unauthorized: Invalid bearer token')
		}
		if (response.status === 404) {
			throw new Error('Object not found')
		}
		throw new Error(`Failed to fetch object data: ${response.statusText}`)
	}

	const data = (await response.json()) as ObjectDetailResponse
	const etag = response.headers.get('ETag')

	return { data, etag, notModified: false }
}

// Legacy function for backward compatibility
export async function fetchObjectData(publicId: string): Promise<ObjectData> {
	const url = `${CMS_API_URL}/api/v1/app/objects/public/${publicId}/full`

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${BEARER_TOKEN}`,
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Unauthorized: Invalid bearer token')
		}
		if (response.status === 404) {
			throw new Error('Object not found')
		}
		throw new Error(`Failed to fetch object data: ${response.statusText}`)
	}

	const data = await response.json()
	return data as ObjectData
}

export type LibraryObject = {
	publicId: string
	title: string
	description: string | object | null
	user: {
		id: number
		publicId: string | null
		givenName: string | null
		familyName: string | null
		email: string | null
	}
	collection: {
		id: number | null
		publicId: string | null
		title: string | null
	}
	category: {
		id: number
		publicId: string | null
		title: string
	} | null
	posterUrl: string | null
}

export type LibraryObjectsResponse = {
	items: Array<LibraryObject>
	total: number
	page: number
	pageSize: number
	version: string
}

export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'alphabetical-desc'

export type Collection = {
	id: number
	publicId: string
	title: string
}

export type Category = {
	id: number
	publicId: string
	title: string
}

function getSortParam(sort: SortOption): string {
	switch (sort) {
		case 'newest':
			return 'id:desc'
		case 'oldest':
			return 'id:asc'
		case 'alphabetical':
			return 'title:asc'
		case 'alphabetical-desc':
			return 'title:desc'
		default:
			return 'id:desc'
	}
}

export async function fetchCollections(): Promise<Array<Collection>> {
	const url = `${CMS_API_URL}/api/v1/app/collections`

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${BEARER_TOKEN}`,
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Unauthorized: Invalid bearer token')
		}
		throw new Error(`Failed to fetch collections: ${response.statusText}`)
	}

	const data = await response.json()
	return data.data as Array<Collection>
}

export async function fetchCategories(): Promise<Array<Category>> {
	const url = `${CMS_API_URL}/api/v1/app/categories`

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${BEARER_TOKEN}`,
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Unauthorized: Invalid bearer token')
		}
		throw new Error(`Failed to fetch categories: ${response.statusText}`)
	}

	const data = await response.json()
	return data.data as Array<Category>
}

export async function fetchLibraryObjects(
	page: number = 1,
	pageSize: number = 20,
	sort: SortOption = 'newest',
	collectionIds?: Array<number>,
	categoryIds?: Array<number>,
	search?: string
): Promise<LibraryObjectsResponse> {
	const url = new URL(`${CMS_API_URL}/api/v1/objects/public`)
	url.searchParams.set('page', String(page))
	url.searchParams.set('pageSize', String(pageSize))
	url.searchParams.set('sort', getSortParam(sort))

	if (search && search.trim().length > 0) {
		url.searchParams.set('search', search.trim())
	}

	const filterParts: Array<string> = []
	if (collectionIds && collectionIds.length > 0) {
		filterParts.push(`collectionId:${collectionIds.join(',')}`)
	}
	if (categoryIds && categoryIds.length > 0) {
		filterParts.push(`categoryId:${categoryIds.join(',')}`)
	}
	if (filterParts.length > 0) {
		url.searchParams.set('filter', filterParts.join('&'))
	}

	try {
		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${BEARER_TOKEN}`,
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error('Unauthorized: Invalid bearer token')
			}
			throw new Error(`Failed to fetch library objects: ${response.statusText}`)
		}

		const data = await response.json()
		return data as LibraryObjectsResponse
	} catch (error) {
		if (error instanceof TypeError && error.message.includes('fetch')) {
			throw new Error('Network request failed. Please check your internet connection.')
		}
		throw error
	}
}

export async function fetchObjectByToken(token: string): Promise<ObjectDetailResponse> {
	const url = `${CMS_API_URL}/api/v1/app/objects/token?token=${encodeURIComponent(token)}`

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${BEARER_TOKEN}`,
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid or expired token')
		}
		if (response.status === 404) {
			throw new Error('Object not found')
		}
		if (response.status === 429) {
			throw new Error('Rate limit exceeded. Please try again later.')
		}
		throw new Error(`Failed to fetch object data: ${response.statusText}`)
	}

	const data = (await response.json()) as ObjectDetailResponse
	return data
}
