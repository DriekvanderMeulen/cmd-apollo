import { createCmsClient, createMockCmsClient, type CmsClient, type Item, CmsNotFoundError } from 'cms'

let clientInstance: CmsClient | null = null

export function getCmsClient(): CmsClient {
	if (clientInstance) {
		return clientInstance
	}

	const baseUrl = process.env.EXPO_PUBLIC_CMS_BASE_URL
	const accessToken = process.env.EXPO_PUBLIC_CMS_ACCESS_TOKEN

	if (baseUrl) {
		clientInstance = createCmsClient({ baseUrl, accessToken })
		return clientInstance
	}

	console.warn('Falling back to mock CMS client. Set EXPO_PUBLIC_CMS_BASE_URL for production data.')
	clientInstance = createMockCmsClient()
	return clientInstance
}

export async function fetchItemByIdentifier(identifier: { id?: string; slug?: string }): Promise<Item> {
	const client = getCmsClient()
	const candidateSlug = identifier.slug ?? identifier.id
	if (identifier.id) {
		try {
			return await client.getItemById(identifier.id)
		} catch (error) {
			if (error instanceof CmsNotFoundError && candidateSlug) {
				return client.getItemBySlug(candidateSlug)
			}
			throw error
		}
	}
	if (candidateSlug) {
		return client.getItemBySlug(candidateSlug)
	}
	throw new Error('No identifier provided for CMS fetch')
}

