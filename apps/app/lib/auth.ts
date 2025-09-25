import { makeRedirectUri } from 'expo-auth-session'
import Constants from 'expo-constants'
import * as WebBrowser from 'expo-web-browser'
import * as SecureStore from 'expo-secure-store'
import { ensureNetworkAllowed } from '@/lib/connectivity'

const APP_SCHEME = 'jsmnative'

export function getRedirectUri(): string {
	// In Expo Go, use the proxy/exp scheme; in dev client/standalone, use custom scheme
	if (Constants.appOwnership === 'expo') return makeRedirectUri()
	return makeRedirectUri({ scheme: APP_SCHEME })
}

export function getCmsOrigin(): string {
	const configured = process.env.EXPO_PUBLIC_CMS_ORIGIN
	if (configured && configured.length > 0) return configured
	// return __DEV__ ? 'http://localhost:3000' : 'https://cms.apolloview.app'
	return 'https://cms.apolloview.app'
}

export async function signIn(): Promise<void> {
	await ensureNetworkAllowed()
	const redirectUri = getRedirectUri()
	const cms = getCmsOrigin()

	const result = await WebBrowser.openAuthSessionAsync(
		`${cms}/api/v1/auth/oauth/start?redirect_uri=${encodeURIComponent(redirectUri)}`,
		redirectUri
	)
	const { type, url } = { type: result.type, url: (result as any).url }

	if (type !== 'success' || !url) return

	const appCode = new URL(url).searchParams.get('code')
	if (!appCode) throw new Error('Missing code')

	const res = await fetch(`${cms}/api/v1/app/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ code: appCode }),
	})
	if (!res.ok) throw new Error('Token exchange failed')

	const { accessToken } = (await res.json()) as { accessToken: string }
	await SecureStore.setItemAsync('accessToken', accessToken)
}

export async function getAccessToken(): Promise<string | null> {
	return SecureStore.getItemAsync('accessToken')
}

export async function signOut(): Promise<void> {
	await SecureStore.deleteItemAsync('accessToken')
}

export type AuthUser = {
	userId: number
	email: string
	givenName: string | null
	familyName: string | null
	picture: string | null
	role: 'ADMIN' | 'EDITOR' | 'USER'
	tenantId: number
}

export async function getMe(): Promise<AuthUser | null> {
	await ensureNetworkAllowed()
	const cms = getCmsOrigin()
	const accessToken = await getAccessToken()
	if (!accessToken) return null

	const res = await fetch(`${cms}/api/v1/me`, {
		headers: { authorization: `Bearer ${accessToken}` },
	})
	if (!res.ok) return null
	return res.json() as Promise<AuthUser>
}


