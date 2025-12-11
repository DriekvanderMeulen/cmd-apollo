import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Alert, ActivityIndicator, Platform, TouchableOpacity, Linking } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'

import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/src/providers/ThemeProvider'
import { Colors } from '@/constants/theme'

function extractTokenFromUrl(data: string): string | null {
	// Try to extract token from URL query parameter
	try {
		const urlObj = new URL(data)
		const token = urlObj.searchParams.get('token')
		if (token) return token
	} catch {
		// If URL parsing fails, try regex extraction
		const tokenMatch = data.match(/[?&]token=([^&]+)/)
		if (tokenMatch) {
			return decodeURIComponent(tokenMatch[1])
		}
	}

	// If no token found in URL, check if the data itself is a token
	// (in case QR code contains just the token)
	if (data && data.length > 20 && !data.includes('http')) {
		return data
	}

	return null
}

export function QRScanner(): React.JSX.Element {
	const [permission, requestPermission] = useCameraPermissions()
	const [scanned, setScanned] = useState(false)
	const router = useRouter()
	const { resolvedTheme, isOLED } = useTheme()

	const backgroundColor =
		resolvedTheme === 'light' ? '#fff' : isOLED ? '#000000' : Colors.dark.background

	useEffect(() => {
		if (Platform.OS !== 'web' && !permission) {
			requestPermission()
		}
	}, [permission, requestPermission])

	// Web platform: show download message instead of camera
	if (Platform.OS === 'web') {
		return (
			<View style={[styles.container, styles.webContainer, { backgroundColor }]}>
				<View style={styles.webContent}>
					<ThemedText style={styles.webTitle} type="title">
						QR Code Scanner
					</ThemedText>
					<ThemedText style={styles.webMessage}>
						QR code scanning is not available on web. Please download the mobile app to scan QR codes.
					</ThemedText>
					<TouchableOpacity
						style={[styles.downloadButton, { backgroundColor: Colors[resolvedTheme ?? 'light'].tint }]}
						onPress={() => Linking.openURL('#')}
					>
						<ThemedText style={styles.downloadButtonText}>Download App</ThemedText>
					</TouchableOpacity>
					<ThemedText style={styles.webSubMessage}>
						Alternatively, you can use your device's camera app to scan QR codes and open the links
						directly.
					</ThemedText>
				</View>
			</View>
		)
	}

	if (!permission) {
		return (
			<View style={[styles.container, { backgroundColor }]}>
				<ActivityIndicator size="large" />
				<ThemedText style={styles.message}>Requesting camera permission...</ThemedText>
			</View>
		)
	}

	if (!permission.granted) {
		return (
			<View style={[styles.container, { backgroundColor }]}>
				<ThemedText style={styles.message} type="defaultSemiBold">
					Camera permission required
				</ThemedText>
				<ThemedText style={styles.subMessage}>
					We need access to your camera to scan QR codes. Please enable camera permissions in your device
					settings.
				</ThemedText>
			</View>
		)
	}

	function handleBarCodeScanned({ data }: { data: string }) {
		if (scanned) {
			return
		}

		// Validate URL origin first
		let urlObj
		try {
			urlObj = new URL(data)
		} catch {
			// Silently ignore non-URL data
			return
		}

		if (urlObj.hostname !== 'cms.apolloview.app') {
			// Silently ignore wrong domain
			return
		}

		const token = extractTokenFromUrl(data)

		if (!token) {
			// Silently ignore no token
			return
		}

		setScanned(true)
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

		router.push(`/open?token=${encodeURIComponent(token)}`)

		// Allow re-scan after navigation or a short delay
		setTimeout(() => {
			setScanned(false)
		}, 1500)
	}

	return (
		<View style={styles.container}>
			<CameraView
				style={styles.camera}
				barcodeScannerSettings={{
					barcodeTypes: ['qr'],
				}}
				onBarcodeScanned={handleBarCodeScanned}
			>
				<View style={styles.overlay}>
					<View style={styles.scanArea}>
						<View style={[styles.corner, styles.topLeft]} />
						<View style={[styles.corner, styles.topRight]} />
						<View style={[styles.corner, styles.bottomLeft]} />
						<View style={[styles.corner, styles.bottomRight]} />
					</View>
					<View style={styles.instructionsContainer}>
						<ThemedText style={styles.instructionText} type="defaultSemiBold">
							Position the QR code within the frame
						</ThemedText>
					</View>
				</View>
			</CameraView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	camera: {
		flex: 1,
		width: '100%',
	},
	overlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	scanArea: {
		width: 250,
		height: 250,
		position: 'relative',
	},
	corner: {
		position: 'absolute',
		width: 30,
		height: 30,
		borderColor: '#fff',
		borderWidth: 3,
	},
	topLeft: {
		top: 0,
		left: 0,
		borderRightWidth: 0,
		borderBottomWidth: 0,
	},
	topRight: {
		top: 0,
		right: 0,
		borderLeftWidth: 0,
		borderBottomWidth: 0,
	},
	bottomLeft: {
		bottom: 0,
		left: 0,
		borderRightWidth: 0,
		borderTopWidth: 0,
	},
	bottomRight: {
		bottom: 0,
		right: 0,
		borderLeftWidth: 0,
		borderTopWidth: 0,
	},
	instructionsContainer: {
		marginTop: 40,
		paddingHorizontal: 20,
	},
	instructionText: {
		color: '#fff',
		textAlign: 'center',
		fontSize: 16,
	},
	message: {
		textAlign: 'center',
		marginBottom: 16,
		paddingHorizontal: 20,
	},
	subMessage: {
		textAlign: 'center',
		paddingHorizontal: 20,
		opacity: 0.7,
	},
	webContainer: {
		padding: 24,
	},
	webContent: {
		maxWidth: 400,
		width: '100%',
		alignItems: 'center',
	},
	webTitle: {
		fontSize: 24,
		marginBottom: 16,
		textAlign: 'center',
	},
	webMessage: {
		textAlign: 'center',
		marginBottom: 24,
		fontSize: 16,
		lineHeight: 24,
		opacity: 0.8,
	},
	webSubMessage: {
		textAlign: 'center',
		marginTop: 24,
		fontSize: 14,
		lineHeight: 20,
		opacity: 0.7,
	},
	downloadButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		minWidth: 200,
	},
	downloadButtonText: {
		color: '#000000',
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'center',
	},
})

