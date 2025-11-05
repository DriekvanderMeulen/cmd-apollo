import React, { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/src/providers/ThemeProvider'
import { Colors } from '@/constants/theme'

type ScreenContainerProps = {
	title: string
	children?: ReactNode
}

export function ScreenContainer({ title, children }: ScreenContainerProps): React.JSX.Element {
	const { resolvedTheme, isOLED } = useTheme()

	const backgroundColor =
		resolvedTheme === 'light' ? '#fff' : isOLED ? '#000000' : Colors.dark.background

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor }]}
			edges={['top', 'left', 'right', 'bottom']}
		>
			<ThemedText style={styles.title} type="title">
				{title}
			</ThemedText>
			{/* Content area respects safe insets + padding */}
			<SafeAreaView style={styles.content} edges={['left', 'right', 'bottom']}>
				{children}
			</SafeAreaView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 24,
		paddingVertical: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: '600',
		marginBottom: 16,
	},
	content: {
		flex: 1,
	},
})
