export const PRESIGN_REFRESH_BUFFER_SECONDS = 60

export interface PresignRequestConfig {
	endpoint: string
	key: string
	fetchImplementation?: typeof fetch
}

export interface PresignedAsset {
	url: string
	expiresAt: number
}

export async function requestPresignedAsset(config: PresignRequestConfig): Promise<PresignedAsset> {
	const { endpoint, key } = config
	const fetchImpl = config.fetchImplementation ?? globalThis.fetch
	if (!fetchImpl) {
		throw new Error('fetch implementation unavailable for presign request')
	}
	const response = await fetchImpl(`${endpoint}?key=${encodeURIComponent(key)}`)
	if (!response.ok) {
		throw new Error(`Presign request failed with status ${response.status}`)
	}
	const payload = (await response.json()) as PresignedAsset
	return payload
}

export function isExternalAssetKey(key: string): boolean {
	return key.startsWith('http://') || key.startsWith('https://')
}

