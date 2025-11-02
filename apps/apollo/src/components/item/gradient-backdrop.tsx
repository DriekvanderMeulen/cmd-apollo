import React from 'react'
import type { ReactNode } from 'react'
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { getOverlayStops } from '@repo/ui/overlay'
import type { ThemeMode } from '@repo/ui/theme'

interface GradientBackdropProps {
	mode: ThemeMode
	style?: StyleProp<ViewStyle>
	children?: ReactNode
}

export function GradientBackdrop(props: GradientBackdropProps): JSX.Element {
	const { mode, style, children } = props
	const stops = getOverlayStops(mode)
	const colors = stops.map((stop) => applyAlpha(stop.color, stop.opacity))
	const locations = stops.map((stop) => stop.position)

	return (
		<LinearGradient
			colors={colors}
			locations={locations}
			start={{ x: 0, y: 0 }}
			end={{ x: 0, y: 1 }}
			style={[StyleSheet.absoluteFill, style]}
		>
			{children}
		</LinearGradient>
	)
}

function applyAlpha(hex: string, alpha: number): string {
	const normalized = hex.replace('#', '')
	if (normalized.length !== 6) {
		return hex
	}
	const value = Number.parseInt(normalized, 16)
	const r = value >> 16
	const g = (value >> 8) & 255
	const b = value & 255
	return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

