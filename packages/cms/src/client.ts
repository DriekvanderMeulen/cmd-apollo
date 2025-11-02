import { ItemSchema, CmsNotFoundError, CmsRequestError } from './types'
import type { CmsClient, CmsClientConfig, Item } from './types'

export function createCmsClient(config: CmsClientConfig): CmsClient {
	const baseUrl = normalizeBaseUrl(config.baseUrl)
	const fetchImplementation = config.fetchImplementation ?? globalThis.fetch

	if (!fetchImplementation) {
		throw new Error('Global fetch implementation not found. Provide fetchImplementation.')
	}

	return {
		async getItemById(id: string): Promise<Item> {
			return requestItem(`${baseUrl}/api/v1/items/${encodeURIComponent(id)}`)
		},
		async getItemBySlug(slug: string): Promise<Item> {
			return requestItem(`${baseUrl}/api/v1/items/slug/${encodeURIComponent(slug)}`)
		}
	}

	async function requestItem(url: string): Promise<Item> {
		const response = await fetchImplementation(url, {
			headers: buildHeaders(config.accessToken)
		})

		if (response.status === 404) {
			throw new CmsNotFoundError('Item not found')
		}

		if (!response.ok) {
			const body = await safeReadJson(response)
			const message = typeof body?.error === 'string' ? body.error : `Request failed with status ${response.status}`
			throw new CmsRequestError(message, response.status)
		}

		const payload = await safeReadJson(response)
		return ItemSchema.parse(payload)
	}
}

function normalizeBaseUrl(url: string): string {
	return url.endsWith('/') ? url.slice(0, -1) : url
}

function buildHeaders(accessToken?: string): HeadersInit {
	const headers: HeadersInit = {
		Accept: 'application/json'
	}

	if (accessToken) {
		return { ...headers, Authorization: `Bearer ${accessToken}` }
	}

	return headers
}

async function safeReadJson(response: Response): Promise<unknown> {
	const text = await response.text()
	if (!text) {
		return null
	}

	try {
		return JSON.parse(text)
	} catch (error) {
		return { error: 'Unable to parse JSON response', detail: error instanceof Error ? error.message : String(error) }
	}
}

