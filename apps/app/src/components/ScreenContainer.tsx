import React, { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

type ScreenContainerProps = {
	title: string
	children?: ReactNode
}

export function ScreenContainer({ title, children }: ScreenContainerProps): React.JSX.Element {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>{title}</Text>
			<View style={styles.content}>{children}</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		paddingHorizontal: 24,
		paddingVertical: 32,
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
