import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useColorScheme } from 'react-native'
import { selectThemeColor, theme } from '@repo/ui/theme'

export default function ExploreScreen(): JSX.Element {
	const mode = useColorScheme() === 'dark' ? 'dark' : 'light'

	return (
		<View style={[styles.container, { backgroundColor: selectThemeColor(mode, 'background') }]}>
			<Text style={[styles.title, { color: theme.color.text[mode] }]}>Explore</Text>
			<Text style={[styles.body, { color: theme.color.subtleText[mode] }]}>Discovery tools coming soon.</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 24,
		paddingVertical: 32,
		justifyContent: 'center'
	},
	title: {
		fontSize: 24,
		fontWeight: '600',
		marginBottom: 8
	},
	body: {
		fontSize: 16,
		lineHeight: 22
	}
})

