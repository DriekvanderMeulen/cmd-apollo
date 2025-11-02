import type { ExpoConfig } from '@expo/config-types'

const scheme = process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME ?? 'apollo'
const universalLinkBase = process.env.EXPO_PUBLIC_UNIVERSAL_LINK_BASE ?? 'https://a.example.com'

const config: ExpoConfig = {
	name: 'Apollo',
	slug: 'apollo',
	version: '0.1.0',
	scheme,
	orientation: 'portrait',
	userInterfaceStyle: 'automatic',
	icon: '../app/assets/icon.png',
	splash: {
		image: '../app/assets/splash-icon.png',
		resizeMode: 'contain',
		backgroundColor: '#000000'
	},
	assetBundlePatterns: ['**/*'],
	ios: {
		supportsTablet: false,
		bundleIdentifier: 'app.apollo.viewer',
		associatedDomains: [`applinks:${stripProtocol(universalLinkBase)}`]
	},
	android: {
		adaptiveIcon: {
			foregroundImage: '../app/assets/android-icon-foreground.png',
			backgroundColor: '#000000'
		},
		package: 'app.apollo.viewer'
	},
	web: {
		bundler: 'metro',
		favicon: '../app/assets/favicon.png'
	},
	extra: {
		universalLinkBase,
		deepLinkScheme: scheme
	}
}

export default config

function stripProtocol(url: string): string {
	return url.replace(/^https?:\/\//i, '')
}

