import React from 'react'
import { Text } from 'react-native'

import { ScreenContainer } from '../components/ScreenContainer'

export function SettingsScreen(): React.JSX.Element {
	return (
		<ScreenContainer title="Settings">
			<Text>Adjust application preferences from this screen.</Text>
		</ScreenContainer>
	)
}
