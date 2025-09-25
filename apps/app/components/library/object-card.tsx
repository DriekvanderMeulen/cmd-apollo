import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { IconSymbol } from '@/components/ui/icon-symbol'

type ObjectCardProps = {
	title: string
	username?: string | null
	tenantLabel?: string | null
	categoryLabel?: string | null
	collectionLabel?: string | null
	onPress?: () => void
    // New: download indicator and actions
    downloaded?: boolean
    downloading?: boolean
    sizeLabel?: string | null
    onPressDownloadIcon?: () => void
}

export default function ObjectCard({ title, username, tenantLabel, categoryLabel, collectionLabel, onPress, downloaded, downloading, sizeLabel, onPressDownloadIcon }: ObjectCardProps) {
	return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Open ${title}`}
            className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 active:opacity-80"
        >
            <View className="flex-1 pr-4">
                <Text className="font-semibold text-[16px] text-black dark:text-white" numberOfLines={1}>
					{title}
				</Text>
				{username ? (
                    <Text className="text-[12px] text-neutral-500 mt-1" numberOfLines={1}>
						{username}
					</Text>
				) : null}
			</View>
            <View className="items-end gap-1" accessible accessibilityRole="summary" accessibilityLabel={`Metadata for ${title}` }>
				{tenantLabel ? (
                    <Text className="text-[12px] text-neutral-500" numberOfLines={1}>{tenantLabel}
                    </Text>
				) : null}
				{categoryLabel ? (
                    <Text className="text-[12px] text-neutral-500" numberOfLines={1}>{categoryLabel}</Text>
				) : null}
				{collectionLabel ? (
                    <Text className="text-[12px] text-neutral-500" numberOfLines={1}>{collectionLabel}</Text>
				) : null}
                <View className="flex-row items-center gap-2 mt-1">
                    {sizeLabel ? (
                        <Text className="text-[12px] text-neutral-500" numberOfLines={1}>{sizeLabel}</Text>
                    ) : null}
                    {downloading ? (
                        <ActivityIndicator size="small" accessibilityLabel="Downloading" />
                    ) : null}
                    <Pressable
                        onPress={onPressDownloadIcon}
                        hitSlop={10}
                        disabled={!onPressDownloadIcon}
                        className="active:opacity-70"
                        accessibilityRole="button"
                        accessibilityLabel={downloaded ? 'Delete downloaded files' : 'Download files'}
                    >
                        <IconSymbol
                            name={downloaded ? 'arrow.down.circle.fill' : 'arrow.down.circle'}
                            size={18}
                            color={downloading ? '#9CA3AF' : downloaded ? '#16A34A' : '#0F62FE'}
                        />
                    </Pressable>
                </View>
			</View>
		</Pressable>
	)
}


