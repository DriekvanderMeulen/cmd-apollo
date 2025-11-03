import { BEARER_TOKEN, CMS_API_URL } from '@/constants/config'
import type { ObjectData } from './storage'

export async function fetchObjectData(
	publicId: string,
): Promise<ObjectData> {
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

