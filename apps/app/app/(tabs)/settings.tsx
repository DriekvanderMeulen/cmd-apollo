import { useCallback, useEffect, useState } from 'react'
import { Image } from 'expo-image'
import { Pressable, View, Switch, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { getMe, signOut, type AuthUser } from '@/lib/auth'
import { getAllowCellularData, setAllowCellularData } from '@/lib/connectivity'
import { useAppTheme, type ThemeMode } from '../../components/app-theme-provider'
import { useR2Cache } from '@/components/r2-cache-provider'

type Me = AuthUser

export default function SettingsScreen() {
	const [me, setMe] = useState<Me | null>(null)
	const [loading, setLoading] = useState(true)
	const [signingOut, setSigningOut] = useState(false)
  const [allowCellularData, setAllowCellularDataState] = useState(false)
  const { mode, setMode, oled, setOled } = useAppTheme()
  const { getTotalCachedSize, clearAll } = useR2Cache()
  const [cacheSize, setCacheSize] = useState(0)

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

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const stored = await getAllowCellularData()
      if (!cancelled) setAllowCellularDataState(stored)
    })()
    return () => { cancelled = true }
  }, [])

  const onToggleCellularData = useCallback((next: boolean) => {
    if (next) {
      Alert.alert(
        'Enable cellular data?',
        'Using cellular may consume significant mobile data. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', style: 'default', onPress: async () => { setAllowCellularDataState(true); await setAllowCellularData(true) } },
        ]
      )
      return
    }
    setAllowCellularDataState(false)
    setAllowCellularData(false)
  }, [])

  useEffect(() => {
    setCacheSize(getTotalCachedSize())
  })

  function formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let idx = 0
    let value = bytes
    while (value >= 1000 && idx < units.length - 1) {
      value = value / 1000
      idx++
    }
    const fixed = value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(1)
    return `${Number(fixed)} ${units[idx]}`
  }

  const onClearStorage = useCallback(() => {
    Alert.alert(
      'Clear storage?',
      'This will remove all downloaded files.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => { clearAll(); setCacheSize(0) } },
      ]
    )
  }, [clearAll])

	return (
		<ThemedView className="flex-1">
			<SafeAreaView style={{ flex: 1 }}>
				<View className="px-6 py-8 gap-6">
			<ThemedText type="title">Settings</ThemedText>
			<View className="gap-3">
				<ThemedText type="subtitle">Account</ThemedText>
				<ThemedView colorName="card" className="rounded-[10px] border border-neutral-200 px-4 py-4 gap-4">
					<View className="flex-row items-center gap-4">
						{me?.picture ? (
							<Image source={{ uri: me.picture }} className="w-12 h-12 rounded-full" />
						) : (
							<ThemedView colorName="border" className="w-12 h-12 rounded-full" />
						)}
						<View className="flex-1">
							<ThemedText type="defaultSemiBold">{loading ? 'Loading…' : `${me?.givenName || ''} ${me?.familyName || ''}`.trim() || '—'}</ThemedText>
							<ThemedText className="opacity-70">{loading ? '' : me?.email ?? ''}</ThemedText>
						</View>
					</View>
					<Pressable
						accessibilityRole="button"
						onPress={onLogout}
						className="rounded-[10px] border border-neutral-200 py-3.5 items-center justify-center"
					>
						<ThemedText className="text-red-600 font-semibold">{signingOut ? 'Logging out…' : 'Log out'}</ThemedText>
					</Pressable>
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
            <ThemedText type="subtitle">Data</ThemedText>
            <ThemedView colorName="card" className="rounded-[12px] border border-neutral-200 px-5 py-5 gap-5">
              <View className="flex-row items-center justify-between">
                <ThemedText className="opacity-80">Use cellular data</ThemedText>
                <Switch
                  value={allowCellularData}
                  onValueChange={onToggleCellularData}
                  accessibilityLabel="Use cellular data"
                />
              </View>
              <View className="flex-row items-center justify-between">
                <ThemedText className="opacity-80">Storage used</ThemedText>
                <ThemedText className="font-semibold">{formatBytes(cacheSize)}</ThemedText>
              </View>
              <Pressable
                onPress={onClearStorage}
                className="rounded-[10px] border border-neutral-200 py-3.5 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Clear downloaded storage"
              >
                <ThemedText className="font-semibold">Clear storage</ThemedText>
              </Pressable>
            </ThemedView>
			</View>
				</View>
			</SafeAreaView>
		</ThemedView>
	)
}


