import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useColorScheme } from 'react-native'
import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native'
import * as SecureStore from 'expo-secure-store'

import { getCmsOrigin, getAccessToken } from '@/lib/auth'

export type ThemeMode = 'system' | 'light' | 'dark'

export type ThemeColors = {
	text: string
	background: string
	tint: string
	icon: string
	border: string
	card: string
	tabIconDefault: string
	tabIconSelected: string
}

export type DesignTokens = {
	light: ThemeColors
	dark: ThemeColors
}

type ThemeContextValue = {
	mode: ThemeMode
	setMode: (mode: ThemeMode) => void
	oled: boolean
	setOled: (value: boolean) => void
	colors: ThemeColors
	resolvedScheme: 'light' | 'dark'
	navigationTheme: NavigationTheme
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const DEFAULT_TOKENS: DesignTokens = {
	light: {
		text: '#11181C',
		background: '#ffffff',
		tint: '#1068FF',
		icon: '#687076',
		border: '#E5E7EB',
		card: '#ffffff',
		tabIconDefault: '#687076',
		tabIconSelected: '#1068FF',
	},
	dark: {
		text: '#ECEDEE',
		background: '#151718',
		tint: '#FFB000',
		icon: '#9BA1A6',
		border: '#3F3F46',
		card: '#151718',
		tabIconDefault: '#9BA1A6',
		tabIconSelected: '#FFFFFF',
	},
}

async function fetchCmsTokens(): Promise<Partial<DesignTokens> | null> {
	try {
		const cmsOrigin = getCmsOrigin()
		const unauth = await fetch(`${cmsOrigin}/api/v1/design-tokens`)
		if (unauth.ok) return (await unauth.json()) as Partial<DesignTokens>

		const accessToken = await getAccessToken()
		if (!accessToken) return null
		const authed = await fetch(`${cmsOrigin}/api/v1/design-tokens`, {
			headers: { authorization: `Bearer ${accessToken}` },
		})
		if (!authed.ok) return null
		return (await authed.json()) as Partial<DesignTokens>
	} catch {
		return null
	}
}

function mergeTokens(base: DesignTokens, override: Partial<DesignTokens> | null, oledBlack: boolean): DesignTokens {
	const merged: DesignTokens = {
		light: { ...base.light, ...(override?.light ?? {}) },
		dark: { ...base.dark, ...(override?.dark ?? {}) },
	}
	if (oledBlack) {
		merged.dark = {
			...merged.dark,
			background: '#000000',
			card: '#000000',
			text: merged.dark.text || '#FFFFFF',
		}
	}
	return merged
}

const KEY_MODE = 'theme.mode'
const KEY_OLED = 'theme.oled'

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
	const systemScheme = useColorScheme()
	const [mode, setModeState] = useState<ThemeMode>('system')
	const [oled, setOledState] = useState(false)
	const [tokens, setTokens] = useState<DesignTokens>(DEFAULT_TOKENS)

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				const [storedMode, storedOled, cms] = await Promise.all([
					SecureStore.getItemAsync(KEY_MODE),
					SecureStore.getItemAsync(KEY_OLED),
					fetchCmsTokens(),
				])
				if (cancelled) return
				if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') setModeState(storedMode)
				if (storedOled === 'true' || storedOled === 'false') setOledState(storedOled === 'true')
				setTokens(mergeTokens(DEFAULT_TOKENS, cms, storedOled === 'true'))
			} catch {
				// ignore
			}
		})()
		return () => {
			cancelled = true
		}
	}, [])

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				await SecureStore.setItemAsync(KEY_MODE, mode)
			} catch {}
		})()
		return () => {
			cancelled = true
		}
	}, [mode])

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				await SecureStore.setItemAsync(KEY_OLED, oled ? 'true' : 'false')
				setTokens((prev) => mergeTokens(DEFAULT_TOKENS, null, oled))
			} catch {}
		})()
		return () => {
			cancelled = true
		}
	}, [oled])

	const setMode = useCallback((value: ThemeMode) => setModeState(value), [])
	const setOled = useCallback((value: boolean) => setOledState(value), [])

	const resolvedScheme: 'light' | 'dark' = useMemo(() => {
		if (mode === 'light') return 'light'
		if (mode === 'dark') return 'dark'
		return systemScheme === 'dark' ? 'dark' : 'light'
	}, [mode, systemScheme])

	const colors = tokens[resolvedScheme]

	const navigationTheme: NavigationTheme = useMemo(() => {
		const base = resolvedScheme === 'dark' ? DarkTheme : DefaultTheme
		return {
			...base,
			colors: {
				...base.colors,
				primary: colors.tint,
				background: colors.background,
				card: colors.card,
				text: colors.text,
				border: colors.border,
				notification: colors.tint,
			},
		}
	}, [colors, resolvedScheme])

	const value = useMemo<ThemeContextValue>(
		() => ({ mode, setMode, oled, setOled, colors, resolvedScheme, navigationTheme }),
		[mode, setMode, oled, setOled, colors, resolvedScheme, navigationTheme]
	)

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useAppTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext)
	if (!ctx) throw new Error('useAppTheme must be used within AppThemeProvider')
	return ctx
}
