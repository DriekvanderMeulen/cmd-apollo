import React from 'react'
import { StyleSheet } from 'react-native'

import { ScreenContainer } from '@/src/components/ScreenContainer'
import { ThemedText } from '@/components/themed-text'
import { PingStatus } from '@/components/PingStatus'

export default function ScanInstructionsScreen(): React.JSX.Element {
	return (
		<ScreenContainer title="Scan Instructions">
			<ThemedText>Provide clear steps that guide users through scanning a new item.</ThemedText>
			<ThemedText style={styles.pingTitle} type="defaultSemiBold">
				CMS Ping
			</ThemedText>
			<PingStatus />
		</ScreenContainer>
	)
}

const styles = StyleSheet.create({
	pingTitle: {
		marginTop: 16,
	},
})
