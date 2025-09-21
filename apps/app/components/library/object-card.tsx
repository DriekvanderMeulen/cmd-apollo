import { View, Text, Pressable } from 'react-native'

type ObjectCardProps = {
	title: string
	username?: string | null
	tenantLabel?: string | null
	categoryLabel?: string | null
	collectionLabel?: string | null
	onPress?: () => void
}

export default function ObjectCard({ title, username, tenantLabel, categoryLabel, collectionLabel, onPress }: ObjectCardProps) {
	return (
		<Pressable onPress={onPress} className="flex-row items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 active:opacity-70">
			<View>
				<Text className="font-semibold text-base text-zinc-900 dark:text-zinc-100" numberOfLines={1}>
					{title}
				</Text>
				{username ? (
					<Text className="text-xs text-zinc-500 mt-1" numberOfLines={1}>
						{username}
					</Text>
				) : null}
			</View>
			<View className="items-end">
				{tenantLabel ? (
					<Text className="text-xs text-zinc-500" numberOfLines={1}>{tenantLabel}</Text>
				) : null}
				{categoryLabel ? (
					<Text className="text-xs text-zinc-500" numberOfLines={1}>{categoryLabel}</Text>
				) : null}
				{collectionLabel ? (
					<Text className="text-xs text-zinc-500" numberOfLines={1}>{collectionLabel}</Text>
				) : null}
			</View>
		</Pressable>
	)
}


