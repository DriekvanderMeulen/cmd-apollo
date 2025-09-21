// app/api/v1/auth/oauth/google/start/route.ts
import { cookies } from 'next/headers'
import { Google } from 'arctic'
import { generateCodeVerifier, generateState } from 'arctic'

function getBaseUrl(): string {
	const isVercel = Boolean(process.env.VERCEL)
	return isVercel ? 'https://cms.apolloview.app' : 'http://localhost:3000'
}

export async function GET(): Promise<Response> {
	const cookieStore = await cookies()

	const state = generateState()
	const codeVerifier = generateCodeVerifier()

	// five minutes should be enough
	cookieStore.set('google_oauth_state', state, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 5
	})
	cookieStore.set('google_oauth_code_verifier', codeVerifier, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 5
	})

	const baseUrl = getBaseUrl()
	const google = new Google(
		process.env.GOOGLE_CLIENT_ID as string,
		process.env.GOOGLE_CLIENT_SECRET as string,
		`${baseUrl}/api/v1/auth/oauth/google/callback`
	)

	// request only what you need
	const authUrl = await google.createAuthorizationURL(state, codeVerifier, ['openid', 'email', 'profile']
	)

	return Response.redirect(authUrl.toString(), 302)
}
