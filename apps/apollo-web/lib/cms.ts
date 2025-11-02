import { cache } from 'react'
import { createCmsClient, createMockCmsClient, type CmsClient, type Item, CmsNotFoundError } from 'cms'

let clientInstance: CmsClient | null = null

function resolveClient(): CmsClient {
	if (clientInstance) {
		return clientInstance
	}
	const baseUrl = process.env.CMS_BASE_URL
	const accessToken = process.env.CMS_ACCESS_TOKEN
	if (baseUrl) {
		clientInstance = createCmsClient({ baseUrl, accessToken })
		return clientInstance
	}
	console.warn('Falling back to mock CMS client. Configure CMS_BASE_URL for production data.')
	clientInstance = createMockCmsClient()
	return clientInstance
}

export const fetchItem = cache(async (identifier: string): Promise<Item> => {
	const client = resolveClient()
	try {
		return await client.getItemById(identifier)
	} catch (error) {
		if (error instanceof CmsNotFoundError) {
			return client.getItemBySlug(identifier)
		}
		throw error
	}
})

