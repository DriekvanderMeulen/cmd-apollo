import React from 'react'
import { Text } from 'react-native'

import { ScreenContainer } from '../components/ScreenContainer'

export function ItemDetailScreen(): React.JSX.Element {
	return (
		<ScreenContainer title="Item Detail">
			<Text>Details for a selected item will be shown on this screen.</Text>
		</ScreenContainer>
	)
}
