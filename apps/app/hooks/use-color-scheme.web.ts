import { useTheme } from '@/src/providers/ThemeProvider'

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 * Also detects system dark mode preference using browser APIs
 */
export function useColorScheme() {
	const { resolvedTheme } = useTheme()
	return resolvedTheme
}
