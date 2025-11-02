import type { ThemeMode } from './theme'

export interface GradientStop {
	color: string
	opacity: number
	position: number
}

const overlayStops: Record<ThemeMode, Array<GradientStop>> = {
	light: [
		{ color: '#FFFFFF', opacity: 0, position: 0 },
		{ color: '#FFFFFF', opacity: 0.65, position: 0.18 },
		{ color: '#FFFFFF', opacity: 0.8, position: 0.5 },
		{ color: '#FFFFFF', opacity: 0.65, position: 0.82 },
		{ color: '#FFFFFF', opacity: 0, position: 1 }
	],
	dark: [
		{ color: '#0A0A0A', opacity: 0, position: 0 },
		{ color: '#0A0A0A', opacity: 0.7, position: 0.2 },
		{ color: '#0A0A0A', opacity: 0.78, position: 0.5 },
		{ color: '#0A0A0A', opacity: 0.7, position: 0.8 },
		{ color: '#0A0A0A', opacity: 0, position: 1 }
	]
}

export function getOverlayStops(mode: ThemeMode): Array<GradientStop> {
	return overlayStops[mode]
}

