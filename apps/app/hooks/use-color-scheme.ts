import { useTheme } from '@/src/providers/ThemeProvider'

export function useColorScheme() {
	const { resolvedTheme } = useTheme()
	return resolvedTheme
}
