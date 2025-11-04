import React from 'react'
import { Text } from 'react-native'
import type { RouteProp } from '@react-navigation/native'

import { ScreenContainer } from '../components/ScreenContainer'
import type { RootStackParamList } from '../types/navigation'

export function ItemDetailScreen({
    route,
}: {
    route: RouteProp<RootStackParamList, 'ItemDetail'>
}): React.JSX.Element {
    const { publicId } = route.params
    return (
        <ScreenContainer title="Item Detail">
            <Text>Public ID: {publicId}</Text>
        </ScreenContainer>
    )
}
