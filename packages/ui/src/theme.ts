export type ThemeMode = 'light' | 'dark'

interface ThemeColorSet {
	primary: Record<ThemeMode, string>
	background: Record<ThemeMode, string>
	text: Record<ThemeMode, string>
	subtleText: Record<ThemeMode, string>
	overlay: Record<ThemeMode, string>
}

interface ThemeTypographyScale {
	display: TypographySpec
	title: TypographySpec
	body: TypographySpec
	subtle: TypographySpec
}

interface TypographySpec {
	fontSize: number
	lineHeight: number
	fontWeight: '400' | '500' | '600' | '700'
}

interface ThemeRadiusScale {
	xs: number
	sm: number
	md: number
	lg: number
}

interface ThemeSpacingScale {
	xs: number
	sm: number
	md: number
	lg: number
	xl: number
}

export interface Theme {
	color: ThemeColorSet
	typography: ThemeTypographyScale
	radius: ThemeRadiusScale
	spacing: ThemeSpacingScale
}

export const theme: Theme = {
	color: {
		primary: {
			light: '#DC2626',
			dark: '#F87171'
		},
		background: {
			light: '#FFFFFF',
			dark: '#0A0A0A'
		},
		text: {
			light: '#111827',
			dark: '#F9FAFB'
		},
		subtleText: {
			light: '#374151',
			dark: '#D1D5DB'
		},
		overlay: {
			light: '#FFFFFF',
			dark: '#0A0A0A'
		}
	},
	typography: {
		display: {
			fontSize: 28,
			lineHeight: 34,
			fontWeight: '600'
		},
		title: {
			fontSize: 22,
			lineHeight: 28,
			fontWeight: '600'
		},
		body: {
			fontSize: 16,
			lineHeight: 22,
			fontWeight: '400'
		},
		subtle: {
			fontSize: 14,
			lineHeight: 20,
			fontWeight: '400'
		}
	},
	radius: {
		xs: 6,
		sm: 12,
		md: 16,
		lg: 24
	},
	spacing: {
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24,
		xl: 32
	}
}

export function selectThemeColor(mode: ThemeMode, selector: keyof ThemeColorSet): string {
	return theme.color[selector][mode]
}

export function getReadableTextColor(mode: ThemeMode): string {
	return mode === 'dark' ? theme.color.text.dark : theme.color.text.light
}

