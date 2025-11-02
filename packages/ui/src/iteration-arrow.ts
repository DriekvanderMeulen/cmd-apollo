import type { ThemeMode } from './theme'
import { theme } from './theme'

export type IterationDirection = 'previous' | 'next'

export interface IterationArrowConfig {
	direction: IterationDirection
	mode: ThemeMode
	disabled?: boolean
}

export interface IterationArrowVisuals {
	iconPath: string
	iconViewBox: string
	backgroundColor: string
	foregroundColor: string
	accessibilityLabel: string
	chevronTransform: string
}

const iconPath = 'M9.707 4.293a1 1 0 0 0-1.414 0L2.586 10l5.707 5.707a1 1 0 0 0 1.414-1.414L5.414 10l4.293-4.293a1 1 0 0 0 0-1.414z'

export function getIterationArrowVisuals(config: IterationArrowConfig): IterationArrowVisuals {
	const { direction, mode, disabled } = config
	const isNext = direction === 'next'
	const foregroundColor = disabled ? withAlpha(theme.color.text[mode], 0.32) : theme.color.text[mode]
	const backgroundColor = disabled ? withAlpha(theme.color.overlay[mode], 0.32) : withAlpha(theme.color.overlay[mode], 0.72)

	return {
		iconPath,
		iconViewBox: '0 0 12 20',
		backgroundColor,
		foregroundColor,
		accessibilityLabel: isNext ? 'View next iteration' : 'View previous iteration',
		chevronTransform: isNext ? 'scale(-1,1) translate(-12,0)' : 'translate(0,0)'
	}
}

function withAlpha(hex: string, alpha: number): string {
	const normalized = hex.replace('#', '')
	if (normalized.length !== 6) {
		return hex
	}

	const integer = Number.parseInt(normalized, 16)
	const r = integer >> 16
	const g = (integer >> 8) & 255
	const b = integer & 255
	return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

