import React from 'react'
import { Text } from 'react-native'

import { ScreenContainer } from '@/src/components/ScreenContainer'

export default function LibraryScreen(): React.JSX.Element {
	return (
		<ScreenContainer title="Library">
			<Text>List of scanned items will appear here.</Text>
		</ScreenContainer>
	)
}
