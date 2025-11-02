import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useColorScheme } from 'react-native'
import { theme } from '@repo/ui/theme'

export function LoadingIndicator(): JSX.Element {
	const mode = useColorScheme() === 'dark' ? 'dark' : 'light'
	return (
		<View style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
			<ActivityIndicator size='large' color={theme.color.primary[mode]} />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		alignItems: 'center',
		justifyContent: 'center'
	}
})

