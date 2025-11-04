import React from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import Constants from 'expo-constants'

import { ScreenContainer } from '../components/ScreenContainer'

export function SettingsScreen(): React.JSX.Element {
  const version = Constants.expoConfig?.version ?? '1.0.0'
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ??
    (Constants.expoConfig?.android?.versionCode
      ? String(Constants.expoConfig.android.versionCode)
      : 'dev')

  function handleOpen(url: string): void {
    Linking.openURL(url).catch(() => {
      // no-op: falling back to non-clickable is acceptable per MVP/NBA
    })
  }

	return (
		<ScreenContainer title="Settings">
			<View style={styles.section}>
				<Text style={styles.label}>Version</Text>
				<Text style={styles.value}>{version}</Text>
			</View>
			<View style={styles.section}>
				<Text style={styles.label}>Build</Text>
				<Text style={styles.value}>{buildNumber}</Text>
			</View>

			<View style={styles.links}>
				<Pressable
					accessibilityRole="link"
					onPress={() => handleOpen('https://cms.apolloview.app/privacy-terms-conditions')}
				>
					<Text style={styles.linkText}>Privacy & Terms</Text>
				</Pressable>
				<Pressable accessibilityRole="link" onPress={() => handleOpen('mailto:hello@driek.dev')}>
					<Text style={styles.linkText}>Data Contact</Text>
				</Pressable>
			</View>
		</ScreenContainer>
	)
}

const styles = StyleSheet.create({
	section: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		color: '#666',
		marginBottom: 4,
	},
	value: {
		fontSize: 16,
		fontWeight: '600',
	},
	links: {
		marginTop: 24,
		gap: 12,
	},
	linkText: {
		fontSize: 16,
		color: '#2563eb',
		textDecorationLine: 'underline',
	},
})
