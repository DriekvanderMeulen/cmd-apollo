import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import type { ThemeMode } from '@repo/ui/theme'
import { getIterationArrowVisuals, type IterationDirection } from '@repo/ui/iteration-arrow'

interface IterationArrowButtonProps {
	direction: IterationDirection
	mode: ThemeMode
	disabled?: boolean
	onPress(): void
}

export function IterationArrowButton(props: IterationArrowButtonProps): JSX.Element {
	const { direction, mode, disabled, onPress } = props
	const visuals = getIterationArrowVisuals({ direction, mode, disabled })

	return (
		<Pressable
			onPress={disabled ? undefined : onPress}
			style={[styles.base, { backgroundColor: visuals.backgroundColor, opacity: disabled ? 0.6 : 1 }]}
			hitSlop={16}
			accessibilityLabel={visuals.accessibilityLabel}
			accessibilityRole='button'
			disabled={disabled}
		>
			<Svg width={20} height={28} viewBox={visuals.iconViewBox}>
				<Path d={visuals.iconPath} fill={visuals.foregroundColor} transform={visuals.chevronTransform} />
			</Svg>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	base: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center'
	}
})

