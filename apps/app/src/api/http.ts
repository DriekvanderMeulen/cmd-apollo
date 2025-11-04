import Constants from 'expo-constants'

type JsonValue = unknown

function resolveBaseUrl(): string {
	const fromEnv = process.env.EXPO_PUBLIC_CMS_URL
	const fromExtra = (Constants.expoConfig as any)?.extra?.cmsUrl as string | undefined
	const baseUrl = fromEnv || fromExtra
	if (!baseUrl) throw new Error('Missing EXPO_PUBLIC_CMS_URL (or app.config extra cmsUrl)')
	return baseUrl.replace(/\/$/, '')
}

function resolveReadToken(): string | undefined {
	const fromEnv = process.env.EXPO_PUBLIC_CMS_READ_TOKEN
	const fromExtra = (Constants.expoConfig as any)?.extra?.cmsReadToken as string | undefined
	return fromEnv || fromExtra
}

export async function get(path: string, init?: RequestInit): Promise<JsonValue> {
	const url = `${resolveBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`
	const token = resolveReadToken()
	const headers: Record<string, string> = {
		Accept: 'application/json',
		...(init?.headers as Record<string, string>),
	}
	if (token) headers.Authorization = `Bearer ${token}`

	const response = await fetch(url, { ...init, method: 'GET', headers })
	if (!response.ok) {
		const bodyText = await response.text().catch(() => '')
		throw new Error(`GET ${url} failed: ${response.status} ${response.statusText} ${bodyText}`)
	}
	const contentType = response.headers.get('content-type') || ''
	if (contentType.includes('application/json')) return response.json()
	return response.text()
}

export const api = { get }
