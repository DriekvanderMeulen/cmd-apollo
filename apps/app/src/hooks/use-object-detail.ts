import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { fetchObjectDetail, type ObjectDetailResponse, type ObjectDetailResult } from '@/lib/api'

type ObjectDetailQueryData = {
	data: ObjectDetailResponse
	etag: string | null
}

type UseObjectDetailOptions = {
	publicId: string
	enabled?: boolean
}

export function useObjectDetail(
	{ publicId, enabled = true }: UseObjectDetailOptions,
	options?: Omit<
		UseQueryOptions<ObjectDetailQueryData, Error>,
		'queryKey' | 'queryFn'
	>
) {
	const queryClient = useQueryClient()

	return useQuery<ObjectDetailQueryData, Error>({
		queryKey: ['object-detail', publicId],
		queryFn: async () => {
			// Get cached ETag from query cache if available
			const cachedData = queryClient.getQueryData<ObjectDetailQueryData>([
				'object-detail',
				publicId,
			])

			const result = await fetchObjectDetail(publicId, {
				ifNoneMatch: cachedData?.etag ?? undefined,
			})

			// Handle 304 Not Modified
			if (result.notModified) {
				if (cachedData) {
					return cachedData
				}
				throw new Error('Cached data not available')
			}

			return { data: result.data, etag: result.etag }
		},
		enabled: enabled && Boolean(publicId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 24 * 60 * 60 * 1000, // 24 hours
		...options,
	})
}
