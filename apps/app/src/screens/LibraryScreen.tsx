import React from 'react'
import { Text } from 'react-native'

import { ScreenContainer } from '../components/ScreenContainer'

export function LibraryScreen(): React.JSX.Element {
	return (
		<ScreenContainer title="Library">
			<Text>List of scanned items will appear here.</Text>
		</ScreenContainer>
	)
}
