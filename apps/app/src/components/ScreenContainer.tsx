import React, { ReactNode } from 'react'
import { StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type ScreenContainerProps = {
	title: string
	children?: ReactNode
}

export function ScreenContainer({ title, children }: ScreenContainerProps): React.JSX.Element {
	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
			<Text style={styles.title}>{title}</Text>
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
		backgroundColor: '#fff',
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
