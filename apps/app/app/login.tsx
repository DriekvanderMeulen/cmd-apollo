import { useCallback, useState } from 'react'
import { Pressable, View } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { signIn } from '@/lib/auth'
import { useRouter } from 'expo-router'

export default function LoginScreen() {
	const [loading, setLoading] = useState(false)
  const router = useRouter()

	const onLogin = useCallback(async () => {
		if (loading) return
		setLoading(true)
		try {
			await signIn()
			// Small delay to ensure token is properly stored before navigation
			await new Promise(resolve => setTimeout(resolve, 100))
			// navigate into app after successful sign-in
			router.replace('/(tabs)')
		} finally {
			setLoading(false)
		}
	}, [loading])

	return (
		<ThemedView className="flex-1 items-center justify-center px-6">
			<ThemedView className="w-full max-w-[420px] gap-6">
				<ThemedText type="title" className="text-center">Welcome to Apolloview</ThemedText>
				<ThemedText className="text-center opacity-70">Sign in to continue</ThemedText>
				<ThemedView className="rounded-[10px] bg-white border border-neutral-200 p-4 gap-3">
					<Pressable
						accessibilityRole="button"
						onPress={onLogin}
						className="rounded-[10px] bg-[#1068FF] py-3.5 items-center justify-center"
					>
						<ThemedText className="text-white font-semibold">{loading ? 'Signing in…' : 'Sign in with Google'}</ThemedText>
					</Pressable>
				</ThemedView>
			</ThemedView>
		</ThemedView>
	)
}


