import { mockItems } from './mock-data'
import type { CmsClient, Item } from './types'

function cloneItem(item: Item): Item {
	return {
		...item,
		iterations: item.iterations.map((iteration) => ({ ...iteration }))
	}
}

export function createMockCmsClient(): CmsClient {
	return {
		async getItemById(id: string): Promise<Item> {
			const match = mockItems.find((candidate) => candidate.id === id)
			if (!match) {
				throw new Error(`Mock CMS missing item with id ${id}`)
			}
			return cloneItem(match)
		},
		async getItemBySlug(slug: string): Promise<Item> {
			const match = mockItems.find((candidate) => candidate.slug === slug)
			if (!match) {
				throw new Error(`Mock CMS missing item with slug ${slug}`)
			}
			return cloneItem(match)
		}
	}
}

export type MockCmsClient = ReturnType<typeof createMockCmsClient>

