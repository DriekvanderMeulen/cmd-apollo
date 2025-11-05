import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { QueryProvider } from '@/src/providers/QueryProvider'
import { ThemeProvider } from '@/src/providers/ThemeProvider'
import { LibraryPrefetcher } from '@/src/components/LibraryPrefetcher'

import { useColorScheme } from '@/hooks/use-color-scheme'

export const unstable_settings = {
	anchor: '(tabs)',
}

export default function RootLayout() {
	return (
		<ThemeProvider>
			<RootLayoutContent />
		</ThemeProvider>
	)
}

function RootLayoutContent() {
	const colorScheme = useColorScheme()

	return (
		<QueryProvider>
			<LibraryPrefetcher />
			<NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="(tabs)" />
					<Stack.Screen 
						name="[publicId]" 
						getId={({ params }) => `object-${(params as any)?.publicId}`}
					/>
					<Stack.Screen name="modal" options={{ presentation: 'modal' }} />
				</Stack>
				<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
			</NavigationThemeProvider>
		</QueryProvider>
	)
}
