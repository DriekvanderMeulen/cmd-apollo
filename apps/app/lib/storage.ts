import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_PREFIX = '@apollo_object_'

function getStorageKey(publicId: string): string {
	return `${STORAGE_PREFIX}${publicId}`
}

export interface ObjectData {
	object: {
		id: number
		publicId: string
		title: string
		description: unknown
		collectionId: number
		categoryId: number | null
		cfR2Link: string | null
		videoR2Key: string | null
	}
	iterations: Array<{
		id: number
		objectId: number
		title: string
		date: string
		description: unknown
		createdAt: string
	}>
	r2Files: Array<{
		key: string
		size: number | null
		etag: string | null
		lastModified: string | null
		url: string
	}>
}

export async function storeObjectData(
	publicId: string,
	data: ObjectData,
): Promise<void> {
	try {
		const key = getStorageKey(publicId)
		const jsonValue = JSON.stringify(data)
		await AsyncStorage.setItem(key, jsonValue)
	} catch (error) {
		console.error('Error storing object data:', error)
		throw error
	}
}

export async function getObjectData(
	publicId: string,
): Promise<ObjectData | null> {
	try {
		const key = getStorageKey(publicId)
		const jsonValue = await AsyncStorage.getItem(key)
		return jsonValue ? JSON.parse(jsonValue) : null
	} catch (error) {
		console.error('Error retrieving object data:', error)
		return null
	}
}

export async function clearObjectData(publicId: string): Promise<void> {
	try {
		const key = getStorageKey(publicId)
		await AsyncStorage.removeItem(key)
	} catch (error) {
		console.error('Error clearing object data:', error)
		throw error
	}
}

