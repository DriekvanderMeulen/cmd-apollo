import React from 'react'
import { StyleSheet } from 'react-native'

import { TrueDropdown } from './TrueDropdown'
import type { SortOption } from '@/lib/api'

export type { SortOption }

type SortSelectorProps = {
	value: SortOption
	onChange: (value: SortOption) => void
	isOpen?: boolean
	onOpenChange?: (open: boolean) => void
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
	{ value: 'newest', label: 'Newest' },
	{ value: 'oldest', label: 'Oldest' },
	{ value: 'alphabetical', label: 'Alphabetical (A–Z)' },
	{ value: 'alphabetical-desc', label: 'Alphabetical (Z–A)' },
]

export function SortSelector({ value, onChange, isOpen, onOpenChange }: SortSelectorProps): React.JSX.Element {
	return (
		<TrueDropdown<SortOption>
			value={value}
			options={SORT_OPTIONS}
			onChange={onChange}
			placeholder="Sort"
			triggerStyle={styles.trigger}
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			icon="arrow.up.arrow.down"
		/>
	)
}

const styles = StyleSheet.create({
	trigger: {
		flex: 1,
		minWidth: 120,
	},
})

