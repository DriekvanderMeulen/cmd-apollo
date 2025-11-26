import { useState, useEffect } from 'react'
import { Platform, View, Text, Pressable, StyleSheet, Linking } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { Colors } from '@/constants/theme'

const STORAGE_KEY = 'open-in-app-dismissed'

function isIOSDevice(): boolean {
	if (Platform.OS !== 'web') return false
	if (typeof navigator === 'undefined') return false
	return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function OpenInAppBanner() {
	const { theme, background, text, tint } = useThemeColors()
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		if (!isIOSDevice()) return

		AsyncStorage.getItem(STORAGE_KEY).then((dismissed) => {
			if (dismissed !== 'true') {
				setVisible(true)
			}
		})
	}, [])

	function handleOpenApp() {
		// Get current path to pass to the app
		const path = typeof window !== 'undefined' ? window.location.pathname : '/'
		const appUrl = `apolloview://${path}`

		Linking.openURL(appUrl).catch(() => {
			// App not installed - could redirect to App Store here
			// For now, just dismiss the banner
			handleDismiss()
		})
	}

	function handleDismiss() {
		setVisible(false)
		AsyncStorage.setItem(STORAGE_KEY, 'true')
	}

	if (!visible) return null

	const colors = theme === 'dark' ? Colors.dark : Colors.light
	const secondaryText = colors.icon

	return (
		<View style={[styles.banner, { backgroundColor: background }]}>
			<View style={styles.content}>
				<View style={styles.appInfo}>
					<View style={[styles.iconPlaceholder, { backgroundColor: tint }]}>
						<Text style={styles.iconText}>A</Text>
					</View>
					<View style={styles.textContainer}>
						<Text style={[styles.title, { color: text }]}>Apollo</Text>
						<Text style={[styles.subtitle, { color: secondaryText }]}>
							Open in the app for a better experience
						</Text>
					</View>
				</View>
				<View style={styles.actions}>
					<Pressable onPress={handleOpenApp} style={[styles.openButton, { backgroundColor: tint }]}>
						<Text style={styles.openButtonText}>Open</Text>
					</Pressable>
					<Pressable onPress={handleDismiss} style={styles.dismissButton}>
						<Text style={[styles.dismissText, { color: secondaryText }]}>✕</Text>
					</Pressable>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	banner: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1000,
		paddingTop: 50, // Safe area
		paddingBottom: 12,
		paddingHorizontal: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	appInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	iconPlaceholder: {
		width: 40,
		height: 40,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
	},
	textContainer: {
		marginLeft: 12,
		flex: 1,
	},
	title: {
		fontSize: 16,
		fontWeight: '600',
	},
	subtitle: {
		fontSize: 13,
		marginTop: 2,
	},
	actions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	openButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 6,
	},
	openButtonText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
	},
	dismissButton: {
		padding: 8,
	},
	dismissText: {
		fontSize: 16,
	},
})

