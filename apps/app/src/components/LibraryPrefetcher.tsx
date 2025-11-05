import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { fetchLibraryObjects } from '@/lib/api'

const PAGE_SIZE = 20

export function LibraryPrefetcher(): null {
	const queryClient = useQueryClient()

	useEffect(() => {
		queryClient.prefetchInfiniteQuery({
			queryKey: ['library-objects'],
			queryFn: ({ pageParam = 1 }) => fetchLibraryObjects(pageParam, PAGE_SIZE),
			getNextPageParam: (lastPage) => {
				const totalPages = Math.ceil(lastPage.total / lastPage.pageSize)
				const nextPage = lastPage.page + 1
				return nextPage <= totalPages ? nextPage : undefined
			},
			initialPageParam: 1,
		})
	}, [queryClient])

	return null
}

