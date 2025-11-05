import { useTheme } from '@/src/providers/ThemeProvider'
import { Colors } from '@/constants/theme'

export function useThemeColors() {
	const { resolvedTheme, isOLED } = useTheme()

	function getBackgroundColor(defaultLight: string, defaultDark: string): string {
		if (resolvedTheme === 'dark') {
			return isOLED ? '#000000' : defaultDark
		}
		return defaultLight
	}

	return {
		theme: resolvedTheme,
		isOLED,
		background: getBackgroundColor(Colors.light.background, Colors.dark.background),
		text: resolvedTheme === 'dark' ? Colors.dark.text : Colors.light.text,
		icon: resolvedTheme === 'dark' ? Colors.dark.icon : Colors.light.icon,
		tint: resolvedTheme === 'dark' ? Colors.dark.tint : Colors.light.tint,
		getBackgroundColor,
	}
}

