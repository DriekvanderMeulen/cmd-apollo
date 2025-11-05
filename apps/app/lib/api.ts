import { BEARER_TOKEN, CMS_API_URL } from '@/constants/config'
import type { ObjectData } from './storage'

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
	description: unknown
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

export type SortOption = 'newest' | 'alphabetical'

function getSortParam(sort: SortOption): string {
	switch (sort) {
		case 'newest':
			return 'id:desc'
		case 'alphabetical':
			return 'title:asc'
		default:
			return 'id:desc'
	}
}

export async function fetchLibraryObjects(
	page: number = 1,
	pageSize: number = 20,
	sort: SortOption = 'newest'
): Promise<LibraryObjectsResponse> {
	const url = new URL(`${CMS_API_URL}/api/v1/objects/public`)
	url.searchParams.set('page', String(page))
	url.searchParams.set('pageSize', String(pageSize))
	url.searchParams.set('sort', getSortParam(sort))

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
}
