import React, { useState } from 'react'
import { Linking, Pressable, StyleSheet, Switch, View, Platform } from 'react-native'
import Constants from 'expo-constants'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/src/providers/ThemeProvider'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { ScreenContainer } from '@/src/components/ScreenContainer'
import { useQueryClient } from '@tanstack/react-query'

export default function SettingsScreen(): React.JSX.Element {
	const version = Constants.expoConfig?.version ?? '1.0.0'
	const buildNumber =
		Constants.expoConfig?.ios?.buildNumber ??
		(Constants.expoConfig?.android?.versionCode
			? String(Constants.expoConfig.android.versionCode)
			: 'dev')

	const { themePreference, setThemePreference, oledMode, setOLEDMode } = useTheme()
	const colorScheme = useColorScheme()
	const isDark = colorScheme === 'dark'
	const buttonBg = isDark ? '#2a2a2a' : Colors[colorScheme].tint
	const buttonText = isDark ? Colors.dark.text : '#fff'
	const queryClient = useQueryClient()
	const [refetching, setRefetching] = useState(false)

	function handleOpen(url: string): void {
		Linking.openURL(url).catch(() => {
			// no-op: falling back to non-clickable is acceptable per MVP/NBA
		})
	}

	function handleThemeSelect(preference: 'light' | 'dark' | 'system') {
		setThemePreference(preference)
	}

	async function handleRefetchAll(): Promise<void> {
		setRefetching(true)
		try {
			await queryClient.refetchQueries({ type: 'active' })
		} finally {
			setRefetching(false)
		}
	}

	return (
		<ScreenContainer title="Settings">
			<View style={styles.section}>
				<ThemedText style={styles.sectionTitle} type="defaultSemiBold">
					Appearance
				</ThemedText>

				<View style={styles.themeOptions}>
					<Pressable
						style={[
							styles.themeOption,
							themePreference === 'light' ? styles.themeOptionSelected : undefined,
							{
								backgroundColor:
									themePreference === 'light'
										? isDark
											? '#2a2a2a'
											: '#f0f8fa'
										: 'transparent',
								borderColor: isDark ? '#333' : '#e0e0e0',
							},
						]}
						onPress={() => handleThemeSelect('light')}
					>
						<ThemedText style={styles.themeOptionText}>Light</ThemedText>
					</Pressable>

					<Pressable
						style={[
							styles.themeOption,
							themePreference === 'dark' ? styles.themeOptionSelected : undefined,
							{
								backgroundColor:
									themePreference === 'dark'
										? isDark
											? '#2a2a2a'
											: '#f0f8fa'
										: 'transparent',
								borderColor: isDark ? '#333' : '#e0e0e0',
							},
						]}
						onPress={() => handleThemeSelect('dark')}
					>
						<ThemedText style={styles.themeOptionText}>Dark</ThemedText>
					</Pressable>

					<Pressable
						style={[
							styles.themeOption,
							themePreference === 'system' ? styles.themeOptionSelected : undefined,
							{
								backgroundColor:
									themePreference === 'system'
										? isDark
											? '#2a2a2a'
											: '#f0f8fa'
										: 'transparent',
								borderColor: isDark ? '#333' : '#e0e0e0',
							},
						]}
						onPress={() => handleThemeSelect('system')}
					>
						<ThemedText style={styles.themeOptionText}>System</ThemedText>
					</Pressable>
				</View>

				{Platform.OS === 'ios' && isDark ? (
					<View style={styles.switchRow}>
						<View style={styles.switchLabelContainer}>
							<ThemedText style={styles.switchLabel}>OLED Mode</ThemedText>
							<ThemedText style={styles.switchDescription}>
								Use true black backgrounds for OLED displays
							</ThemedText>
						</View>
						<Switch
							value={oledMode}
							onValueChange={setOLEDMode}
							trackColor={{ false: '#767577', true: Colors.dark.tint }}
							thumbColor={oledMode ? '#fff' : '#f4f3f4'}
						/>
					</View>
				) : null}
			</View>

			<View style={styles.section}>
				<ThemedText style={styles.sectionTitle} type="defaultSemiBold">
					About
				</ThemedText>
				<View style={styles.infoRow}>
					<ThemedText style={styles.label}>Version</ThemedText>
					<ThemedText style={styles.value}>{version}</ThemedText>
				</View>
				<View style={styles.infoRow}>
					<ThemedText style={styles.label}>Build</ThemedText>
					<ThemedText style={styles.value}>{buildNumber}</ThemedText>
				</View>
			</View>

			<View style={styles.section}>
				<ThemedText style={styles.sectionTitle} type="defaultSemiBold">
					Utilities
				</ThemedText>
				<Pressable
					accessibilityRole="button"
					style={[
						styles.actionButton,
						{ backgroundColor: buttonBg, borderColor: isDark ? '#333' : 'transparent', borderWidth: isDark ? 1 : 0 },
						refetching ? styles.actionButtonDisabled : undefined,
					]}
					onPress={handleRefetchAll}
					disabled={refetching}
				>
					<ThemedText style={[styles.actionButtonText, { color: buttonText }]}>
						{refetching ? 'Refreshing…' : 'Refetch data'}
					</ThemedText>
				</Pressable>
			</View>

			<View style={styles.section}>
				<ThemedText style={styles.sectionTitle} type="defaultSemiBold">
					Legal
				</ThemedText>
				<Pressable
					accessibilityRole="link"
					onPress={() => handleOpen('https://cms.apolloview.app/privacy-terms-conditions')}
					style={styles.linkButton}
				>
					<ThemedText style={[styles.linkText, { color: Colors[colorScheme].tint }]}>
						Privacy & Terms
					</ThemedText>
				</Pressable>
				<Pressable
					accessibilityRole="link"
					onPress={() => handleOpen('mailto:hello@driek.dev')}
					style={styles.linkButton}
				>
					<ThemedText style={[styles.linkText, { color: Colors[colorScheme].tint }]}>
						Data Contact
					</ThemedText>
				</Pressable>
			</View>
		</ScreenContainer>
	)
}

const styles = StyleSheet.create({
	section: {
		marginBottom: 32,
	},
	sectionTitle: {
		fontSize: 16,
		marginBottom: 16,
	},
	themeOptions: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 16,
	},
	themeOption: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		borderWidth: 1,
		alignItems: 'center',
	},
	themeOptionSelected: {
		// Dynamic styling applied inline
	},
	themeOptionText: {
		fontSize: 14,
		fontWeight: '600',
	},
	switchRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 8,
	},
	switchLabelContainer: {
		flex: 1,
		marginRight: 16,
	},
	switchLabel: {
		fontSize: 16,
		marginBottom: 4,
	},
	switchDescription: {
		fontSize: 14,
		opacity: 0.7,
	},
	infoRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	label: {
		fontSize: 14,
		opacity: 0.7,
	},
	value: {
		fontSize: 14,
		fontWeight: '600',
	},
	linkButton: {
		paddingVertical: 12,
	},
	linkText: {
		fontSize: 16,
		textDecorationLine: 'underline',
	},
	actionButton: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	actionButtonDisabled: {
		opacity: 0.6,
	},
	actionButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
})
