import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Item } from 'cms/types'

const LAST_ITEM_KEY = '@apollo:last-item-id'
const ITEM_CACHE_PREFIX = '@apollo:item:'
const SLUG_CACHE_PREFIX = '@apollo:item-slug:'

export async function loadLastItemId(): Promise<string | null> {
	try {
		return await AsyncStorage.getItem(LAST_ITEM_KEY)
	} catch (error) {
		console.warn('Failed to read last item id', error)
		return null
	}
}

export async function storeLastItemId(id: string): Promise<void> {
	try {
		await AsyncStorage.setItem(LAST_ITEM_KEY, id)
	} catch (error) {
		console.warn('Failed to persist last item id', error)
	}
}

export async function cacheItem(item: Item): Promise<void> {
	try {
		const serialized = JSON.stringify(item)
		await Promise.all([
			AsyncStorage.setItem(cacheKeyForItem(item.id), serialized),
			AsyncStorage.setItem(cacheKeyForSlug(item.slug), item.id)
		])
	} catch (error) {
		console.warn('Failed to cache CMS item', error)
	}
}

export async function readCachedItemById(id: string): Promise<Item | null> {
	try {
		const raw = await AsyncStorage.getItem(cacheKeyForItem(id))
		if (!raw) {
			return null
		}
		return JSON.parse(raw) as Item
	} catch (error) {
		console.warn('Unable to parse cached item', error)
		return null
	}
}

export async function readCachedItemBySlug(slug: string): Promise<Item | null> {
	try {
		const cachedId = await AsyncStorage.getItem(cacheKeyForSlug(slug))
		if (!cachedId) {
			return null
		}
		return await readCachedItemById(cachedId)
	} catch (error) {
		console.warn('Unable to resolve cached item by slug', error)
		return null
	}
}

function cacheKeyForItem(id: string): string {
	return `${ITEM_CACHE_PREFIX}${id}`
}

function cacheKeyForSlug(slug: string): string {
	return `${SLUG_CACHE_PREFIX}${slug}`
}

