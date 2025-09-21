import { useMemo } from 'react'
import { View, Text, TextInput } from 'react-native'
import Dropdown from '@/components/ui/dropdown'

type Option = { id: number; label: string }

type FiltersBarProps = {
	search: string
	onSearchChange: (v: string) => void
	selectedTenantId: number | null
	selectedCategoryId: number | null
	selectedCollectionId: number | null
	onTenantChange: (id: number | null) => void
	onCategoryChange: (id: number | null) => void
	onCollectionChange: (id: number | null) => void
	tenantOptions: Array<Option>
	categoryOptions: Array<Option>
	collectionOptions: Array<Option>
	sort: 'title' | 'updated'
	onSortChange: (v: 'title' | 'updated') => void
	sortDisabled?: boolean
}

export default function FiltersBar(props: FiltersBarProps) {
	const {
		search,
		onSearchChange,
		selectedTenantId,
		selectedCategoryId,
		selectedCollectionId,
		onTenantChange,
		onCategoryChange,
		onCollectionChange,
		tenantOptions,
		categoryOptions,
		collectionOptions,
		sort,
		onSortChange,
		sortDisabled = false,
	} = props

    const sortOptions = useMemo(() => ([
        { value: 'title' as const, label: 'Sort by Title' },
        { value: 'updated' as const, label: 'Sort by Updated' },
    ]), [])

	return (
        <View className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <View className="flex-row items-center mb-3">
                <TextInput
                    value={search}
                    onChangeText={onSearchChange}
                    placeholder="Search title"
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded px-3 py-2 text-sm mr-2 text-zinc-900 dark:text-zinc-100"
                    placeholderTextColor="#9ca3af"
                />
                <View style={{ width: 180 }}>
                    <Dropdown
                        label="Sort"
                        options={sortOptions as any}
                        value={sort}
                        onChange={(v) => onSortChange((v as 'title' | 'updated') ?? 'updated')}
                        disabled={sortDisabled}
                    />
                </View>
            </View>
            <View className="mb-2">
                <Dropdown label="Tenant" options={tenantOptions.map((t) => ({ value: t.id, label: t.label }))} value={selectedTenantId} onChange={onTenantChange} />
            </View>
            <View className="mb-2">
                <Dropdown label="Category" options={categoryOptions.map((t) => ({ value: t.id, label: t.label }))} value={selectedCategoryId} onChange={onCategoryChange} />
            </View>
            <View>
                <Dropdown label="Collection" options={collectionOptions.map((t) => ({ value: t.id, label: t.label }))} value={selectedCollectionId} onChange={onCollectionChange} />
            </View>
        </View>
	)
}


