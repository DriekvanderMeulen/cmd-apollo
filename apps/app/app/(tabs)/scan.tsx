import React from 'react'
import { Text } from 'react-native'

import { ScreenContainer } from '@/src/components/ScreenContainer'
import { PingStatus } from '@/components/PingStatus'

export default function ScanInstructionsScreen(): React.JSX.Element {
	return (
		<ScreenContainer title="Scan Instructions">
			<Text>Provide clear steps that guide users through scanning a new item.</Text>
			<Text style={{ marginTop: 16, fontWeight: '600' }}>CMS Ping</Text>
			<PingStatus />
		</ScreenContainer>
	)
}
