import * as Linking from 'expo-linking'

const universalPrefix = process.env.EXPO_PUBLIC_UNIVERSAL_LINK_BASE ?? 'https://a.example.com'
const scheme = process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME ?? 'apollo'

export const linking = {
	prefixes: [universalPrefix, `${scheme}://`],
	config: {
		screens: {
			Explore: 'explore',
			Library: 'library',
			View: {
				screens: {
					Item: 'item/:id'
				}
			}
		}
	},
	getInitialURL: async () => {
		const initialUrl = await Linking.getInitialURL()
		return initialUrl ?? null
	},
	subscribe(listener: (url: string) => void) {
		const subscription = Linking.addEventListener('url', ({ url }) => listener(url))
		return () => subscription.remove()
	}
} as const

