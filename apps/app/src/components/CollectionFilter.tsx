import React, { useState, useEffect } from 'react'
import { StyleSheet, Pressable, Modal, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { fetchCollections, type Collection } from '@/lib/api'

type CollectionFilterProps = {
	value: number | null
	onChange: (value: number | null) => void
}

export function CollectionFilter({ value, onChange }: CollectionFilterProps): React.JSX.Element {
	const [isOpen, setIsOpen] = useState(false)
	const theme = useColorScheme() ?? 'light'

	const { data: collections, isLoading } = useQuery({
		queryKey: ['collections'],
		queryFn: fetchCollections,
	})

	const selectedCollection = collections?.find((c) => c.id === value)

	function handleSelect(collectionId: number | null): void {
		onChange(collectionId)
		setIsOpen(false)
	}

	return (
		<>
			<Pressable
				style={[styles.trigger, { borderColor: theme === 'light' ? '#e0e0e0' : '#333' }]}
				onPress={() => setIsOpen(true)}
			>
				<ThemedText style={styles.triggerText}>
					{selectedCollection ? `Collection: ${selectedCollection.title}` : 'All Collections'}
				</ThemedText>
				<IconSymbol
					name="chevron.down"
					size={16}
					weight="medium"
					color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
				/>
			</Pressable>

			<Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setIsOpen(false)}
				>
					<View onStartShouldSetResponder={() => true}>
						<ThemedView style={styles.modalContent}>
							{isLoading ? (
								<View style={styles.loadingContainer}>
									<ActivityIndicator size="small" />
								</View>
							) : (
								<>
									<TouchableOpacity
										style={[styles.option, value === null ? styles.optionSelected : undefined]}
										onPress={() => handleSelect(null)}
									>
										<ThemedText
											type={value === null ? 'defaultSemiBold' : 'default'}
											style={value === null ? styles.optionTextSelected : undefined}
										>
											All Collections
										</ThemedText>
										{value === null ? (
											<IconSymbol
												name="checkmark"
												size={18}
												weight="medium"
												color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
											/>
										) : null}
									</TouchableOpacity>
									{collections?.map((collection) => (
										<TouchableOpacity
											key={collection.id}
											style={[
												styles.option,
												value === collection.id ? styles.optionSelected : undefined,
											]}
											onPress={() => handleSelect(collection.id)}
										>
											<ThemedText
												type={value === collection.id ? 'defaultSemiBold' : 'default'}
												style={value === collection.id ? styles.optionTextSelected : undefined}
											>
												{collection.title}
											</ThemedText>
											{value === collection.id ? (
												<IconSymbol
													name="checkmark"
													size={18}
													weight="medium"
													color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
												/>
											) : null}
										</TouchableOpacity>
									))}
								</>
							)}
						</ThemedView>
					</View>
				</TouchableOpacity>
			</Modal>
		</>
	)
}

const styles = StyleSheet.create({
	trigger: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		minWidth: 180,
	},
	triggerText: {
		fontSize: 14,
		marginRight: 8,
		flex: 1,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 8,
		minWidth: 240,
		maxHeight: '80%',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 5,
	},
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	optionSelected: {
		backgroundColor: '#f5f5f5',
	},
	optionTextSelected: {
		color: '#0a7ea4',
	},
	loadingContainer: {
		paddingVertical: 24,
		alignItems: 'center',
	},
})

