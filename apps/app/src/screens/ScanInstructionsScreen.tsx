import React from 'react'
import { Text } from 'react-native'

import { ScreenContainer } from '../components/ScreenContainer'

export function ScanInstructionsScreen(): React.JSX.Element {
	return (
		<ScreenContainer title="Scan Instructions">
			<Text>Provide clear steps that guide users through scanning a new item.</Text>
		</ScreenContainer>
	)
}
