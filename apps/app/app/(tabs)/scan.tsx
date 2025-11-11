import React, { useState } from 'react'
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { QRScanner } from '@/src/components/QRScanner'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/src/providers/ThemeProvider'
import { Colors } from '@/constants/theme'

export default function ScanScreen(): React.JSX.Element {
	const [showInstructions, setShowInstructions] = useState(false)
	const { resolvedTheme, isOLED } = useTheme()

	const backgroundColor =
		resolvedTheme === 'light' ? '#fff' : isOLED ? '#000000' : Colors.dark.background

	if (showInstructions) {
		return (
			<SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => setShowInstructions(false)} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color={Colors[resolvedTheme ?? 'light'].text} />
					</TouchableOpacity>
					<ThemedText style={styles.headerTitle} type="title">
						How to Scan
					</ThemedText>
				</View>
				<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
					<View style={styles.instructionSection}>
						<ThemedText style={styles.instructionTitle} type="defaultSemiBold">
							Step 1: Open the Scanner
						</ThemedText>
						<ThemedText style={styles.instructionText}>
							Tap the back button to return to the camera view. Make sure you have granted camera
							permissions.
						</ThemedText>
					</View>

					<View style={styles.instructionSection}>
						<ThemedText style={styles.instructionTitle} type="defaultSemiBold">
							Step 2: Position the QR Code
						</ThemedText>
						<ThemedText style={styles.instructionText}>
							Hold your device steady and position the Apollo View QR code within the scanning frame. Make sure the QR
							code is well-lit and in focus.
						</ThemedText>
					</View>

					<View style={styles.instructionSection}>
						<ThemedText style={styles.instructionTitle} type="defaultSemiBold">
							Step 3: Wait for Scan
						</ThemedText>
						<ThemedText style={styles.instructionText}>
							The app will automatically detect and scan the QR code. You'll feel a vibration when the scan
							is successful.
						</ThemedText>
					</View>

					<View style={styles.instructionSection}>
						<ThemedText style={styles.instructionTitle} type="defaultSemiBold">
							Step 4: View Content
						</ThemedText>
						<ThemedText style={styles.instructionText}>
							After scanning, you'll be taken to the object detail page where you can view all the
							information.
						</ThemedText>
					</View>

					<View style={styles.tipSection}>
						<ThemedText style={styles.tipTitle} type="defaultSemiBold">
							Tips for Best Results
						</ThemedText>
						<ThemedText style={styles.tipText}>• Ensure good lighting</ThemedText>
						<ThemedText style={styles.tipText}>• Hold the device steady</ThemedText>
						<ThemedText style={styles.tipText}>• Keep the QR code flat and unobstructed</ThemedText>
						<ThemedText style={styles.tipText}>• Maintain a distance of 10-20 cm from the code</ThemedText>
					</View>
				</ScrollView>
			</SafeAreaView>
		)
	}

	return (
		<View style={styles.container}>
			<QRScanner />
			<SafeAreaView style={styles.instructionsButton} edges={['bottom']}>
				<TouchableOpacity
					onPress={() => setShowInstructions(true)}
					style={[styles.helpButton, { backgroundColor: Colors[resolvedTheme ?? 'light'].tint }]}
				>
					<Ionicons name="help-circle-outline" size={20} color="#000000" />
					<ThemedText style={styles.helpButtonText}>How to Scan</ThemedText>
				</TouchableOpacity>
			</SafeAreaView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(0, 0, 0, 0.1)',
	},
	backButton: {
		marginRight: 12,
		padding: 4,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: '600',
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 20,
	},
	instructionSection: {
		marginBottom: 24,
	},
	instructionTitle: {
		fontSize: 18,
		marginBottom: 8,
	},
	instructionText: {
		fontSize: 15,
		lineHeight: 22,
		opacity: 0.8,
	},
	tipSection: {
		marginTop: 8,
		padding: 16,
		backgroundColor: 'rgba(0, 0, 0, 0.05)',
		borderRadius: 8,
	},
	tipTitle: {
		fontSize: 16,
		marginBottom: 12,
	},
	tipText: {
		fontSize: 14,
		marginBottom: 6,
		opacity: 0.8,
	},
	instructionsButton: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 16,
	},
	helpButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		gap: 8,
	},
	helpButtonText: {
		color: '#000000',
		fontSize: 16,
		fontWeight: '600',
	},
})
