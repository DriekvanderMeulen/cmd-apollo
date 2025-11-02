import React from 'react'
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native'
import { useColorScheme } from 'react-native'
import { theme } from '@repo/ui/theme'

interface ErrorSheetProps {
	message: string
	onRetry(): void
	itemId?: string
	slug?: string
}

export function ErrorSheet(props: ErrorSheetProps): JSX.Element {
	const mode = useColorScheme() === 'dark' ? 'dark' : 'light'
	const { message, onRetry, itemId, slug } = props

	const backgroundColor = mode === 'dark' ? 'rgba(10,10,10,0.92)' : 'rgba(255,255,255,0.92)'
	const secondaryBorder = mode === 'dark' ? 'rgba(249,250,251,0.24)' : 'rgba(17,24,39,0.12)'
	const secondaryText = mode === 'dark' ? theme.color.text.dark : theme.color.primary.light

	return (
		<View style={[styles.container, { backgroundColor }]}>
			<Text style={[styles.title, { color: theme.color.text[mode] }]}>We hit a snag</Text>
			<Text style={[styles.message, { color: theme.color.subtleText[mode] }]}>{message}</Text>
			<View style={styles.actions}>
				<Pressable onPress={onRetry} style={[styles.button, { backgroundColor: theme.color.primary[mode] }]} accessibilityRole='button'>
					<Text style={styles.buttonText}>Retry</Text>
				</Pressable>
				<Pressable onPress={() => openInBrowser({ itemId, slug })} style={[styles.button, { borderColor: secondaryBorder, borderWidth: 1 }]} accessibilityRole='button'>
					<Text style={[styles.buttonText, { color: secondaryText }]}>Open on web</Text>
				</Pressable>
			</View>
		</View>
	)
}

function openInBrowser(params: { itemId?: string; slug?: string }): void {
	const base = process.env.EXPO_PUBLIC_UNIVERSAL_LINK_BASE ?? 'https://a.example.com'
	const identifier = params.slug ?? params.itemId
	const target = identifier ? `${base.replace(/\/$/, '')}/i/${identifier}` : base
	Linking.openURL(target).catch((error) => {
		console.warn('Failed to open fallback URL', error)
	})
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		left: 16,
		right: 16,
		bottom: 32,
		borderRadius: 16,
		padding: 24,
		gap: 16
	},
	title: {
		fontSize: 20,
		fontWeight: '600'
	},
	message: {
		fontSize: 16,
		lineHeight: 22
	},
	actions: {
		flexDirection: 'row',
		gap: 12
	},
	button: {
		flex: 1,
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: 'center'
	},
	buttonText: {
		color: '#FFFFFF',
		fontWeight: '600'
	}
})

