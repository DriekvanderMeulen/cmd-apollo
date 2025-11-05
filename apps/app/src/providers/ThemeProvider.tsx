import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useColorScheme as useRNColorScheme, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

type ThemeContextType = {
	themePreference: ThemePreference
	setThemePreference: (preference: ThemePreference) => Promise<void>
	resolvedTheme: ResolvedTheme
	isOLED: boolean
	setOLEDMode: (enabled: boolean) => Promise<void>
	oledMode: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = '@apollo_theme_preference'
const OLED_STORAGE_KEY = '@apollo_oled_mode'

type ThemeProviderProps = {
	children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const systemColorSchemeRN = useRNColorScheme()
	const [systemColorScheme, setSystemColorScheme] = useState<'light' | 'dark' | null>(
		systemColorSchemeRN
	)
	const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system')
	const [oledMode, setOLEDMode] = useState(false)
	const [isLoaded, setIsLoaded] = useState(false)

	// Handle web system preference changes
	useEffect(() => {
		if (Platform.OS !== 'web') {
			setSystemColorScheme(systemColorSchemeRN)
			return
		}

		// Web: listen to system preference changes
		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

			function updateSystemScheme() {
				setSystemColorScheme(mediaQuery.matches ? 'dark' : 'light')
			}

			updateSystemScheme()

			if (mediaQuery.addEventListener) {
				mediaQuery.addEventListener('change', updateSystemScheme)
				return () => mediaQuery.removeEventListener('change', updateSystemScheme)
			} else {
				mediaQuery.addListener(updateSystemScheme)
				return () => mediaQuery.removeListener(updateSystemScheme)
			}
		}
	}, [systemColorSchemeRN])

	// Load preferences from storage
	useEffect(() => {
		async function loadPreferences() {
			try {
				const [savedPreference, savedOLED] = await Promise.all([
					AsyncStorage.getItem(THEME_STORAGE_KEY),
					AsyncStorage.getItem(OLED_STORAGE_KEY),
				])

				if (savedPreference === 'light' || savedPreference === 'dark' || savedPreference === 'system') {
					setThemePreferenceState(savedPreference)
				}

				if (savedOLED === 'true') {
					setOLEDMode(true)
				} else if (savedOLED === 'false') {
					setOLEDMode(false)
				} else {
					// Default: enable OLED mode on iOS devices (optional - user can disable)
					setOLEDMode(Platform.OS === 'ios')
				}

				setIsLoaded(true)
			} catch (error) {
				console.error('Error loading theme preferences:', error)
				setIsLoaded(true)
			}
		}

		loadPreferences()
	}, [])

	const resolvedTheme: ResolvedTheme =
		themePreference === 'system'
			? systemColorScheme === 'dark'
				? 'dark'
				: 'light'
			: themePreference === 'dark'
				? 'dark'
				: 'light'

	const isOLED = Platform.OS === 'ios' && oledMode && resolvedTheme === 'dark'

	async function setThemePreference(preference: ThemePreference) {
		try {
			setThemePreferenceState(preference)
			await AsyncStorage.setItem(THEME_STORAGE_KEY, preference)
		} catch (error) {
			console.error('Error saving theme preference:', error)
		}
	}

	async function setOLEDModePreference(enabled: boolean) {
		try {
			setOLEDMode(enabled)
			await AsyncStorage.setItem(OLED_STORAGE_KEY, String(enabled))
		} catch (error) {
			console.error('Error saving OLED preference:', error)
		}
	}

	// Don't render until preferences are loaded to avoid flash
	if (!isLoaded) {
		return null
	}

	return (
		<ThemeContext.Provider
			value={{
				themePreference,
				setThemePreference,
				resolvedTheme,
				isOLED,
				setOLEDMode: setOLEDModePreference,
				oledMode,
			}}
		>
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme() {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}

