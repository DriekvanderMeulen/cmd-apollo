import { useCallback, useEffect, useState } from 'react'
import { Image } from 'expo-image'
import { Pressable, View, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { getMe, signOut, type AuthUser } from '@/lib/auth'
import { useAppTheme, type ThemeMode } from '../../components/app-theme-provider'

type Me = AuthUser

export default function SettingsScreen() {
	const [me, setMe] = useState<Me | null>(null)
	const [loading, setLoading] = useState(true)
	const [signingOut, setSigningOut] = useState(false)
  const { mode, setMode, oled, setOled } = useAppTheme()

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				const data = await getMe()
				if (!cancelled) {
					setMe(
						data
							? {
								userId: data.userId,
								email: data.email || '',
								givenName: data.givenName ?? null,
								familyName: data.familyName ?? null,
								picture: data.picture ?? null,
								role: data.role,
								tenantId: data.tenantId ?? 0,
							}
							: null
						)
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [])

	const onLogout = useCallback(async () => {
		if (signingOut) return
		setSigningOut(true)
		try {
			await signOut()
			setMe(null)
		} finally {
			setSigningOut(false)
		}
	}, [signingOut])

	return (
		<ThemedView className="flex-1">
			<SafeAreaView style={{ flex: 1 }}>
				<View className="px-6 py-8 gap-6">
			<ThemedText type="title">Settings</ThemedText>
			<View className="gap-3">
				<ThemedText type="subtitle">Account</ThemedText>
				<ThemedView colorName="card" className="rounded-[10px] border border-neutral-200 px-4 py-4 flex-row items-center gap-4">
					{me?.picture ? (
						<Image source={{ uri: me.picture }} className="w-12 h-12 rounded-full" />
					) : (
						<ThemedView colorName="border" className="w-12 h-12 rounded-full" />
					)}
					<View className="flex-1">
						<ThemedText type="defaultSemiBold">{loading ? 'Loading…' : `${me?.givenName || ''} ${me?.familyName || ''}`.trim() || '—'}</ThemedText>
						<ThemedText className="opacity-70">{loading ? '' : me?.email ?? ''}</ThemedText>
					</View>
				</ThemedView>
			</View>
			<View className="gap-3">
				<ThemedText type="subtitle">Appearance</ThemedText>
				<ThemedView colorName="card" className="rounded-[10px] border border-neutral-200 px-4 py-4 gap-4">
					<View>
						<ThemedText className="opacity-70">Theme</ThemedText>
						<View className="flex-row gap-2 mt-2">
							{(['system', 'light', 'dark'] as Array<ThemeMode>).map((opt) => (
								<Pressable
									key={opt}
									onPress={() => setMode(opt)}
									className={`px-3.5 py-2 rounded-[10px] border ${mode === opt ? 'bg-neutral-200 border-neutral-200' : 'border-neutral-200'}`}
								>
									<ThemedText className={`font-semibold ${mode === opt ? 'text-black' : ''}`}>{opt === 'system' ? 'System' : opt === 'light' ? 'Light' : 'Dark'}</ThemedText>
								</Pressable>
							))}
						</View>
					</View>
					<View className="flex-row items-center justify-between">
						<ThemedText className="opacity-70">OLED true black</ThemedText>
						<Switch value={oled} onValueChange={setOled} />
					</View>
				</ThemedView>
			</View>
			<View className="gap-3">
				<ThemedText type="subtitle">Session</ThemedText>
				<Pressable
					accessibilityRole="button"
					onPress={onLogout}
					className="rounded-[10px] border border-neutral-200 py-3.5 items-center justify-center"
				>
					<ThemedText className="text-red-600 font-semibold">{signingOut ? 'Logging out…' : 'Log out'}</ThemedText>
				</Pressable>
			</View>
				</View>
			</SafeAreaView>
		</ThemedView>
	)
}


