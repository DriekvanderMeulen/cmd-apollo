import { PRESIGN_REFRESH_BUFFER_SECONDS, requestPresignedAsset, type PresignedAsset } from 'cms/presign'

const presignCache = new Map<string, PresignedAsset>()

export async function getPresignedAsset(key: string): Promise<PresignedAsset> {
	const now = Math.floor(Date.now() / 1000)
	const cached = presignCache.get(key)
	if (cached && !shouldRefresh(cached, now)) {
		return cached
	}

	const endpoint = process.env.EXPO_PUBLIC_R2_PRESIGN_ENDPOINT
	if (!endpoint) {
		throw new Error('R2 presign endpoint missing')
	}

	const asset = await requestPresignedAsset({ endpoint, key })
	presignCache.set(key, asset)
	return asset
}

export function shouldRefresh(asset: PresignedAsset, nowSeconds?: number): boolean {
	const now = nowSeconds ?? Math.floor(Date.now() / 1000)
	return asset.expiresAt - PRESIGN_REFRESH_BUFFER_SECONDS <= now
}

export function invalidatePresign(key: string): void {
	presignCache.delete(key)
}

