import { ReactNode, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import AsyncStorage from '@react-native-async-storage/async-storage'

type QueryProviderProps = { children: ReactNode }

export function QueryProvider({ children }: QueryProviderProps) {
	const queryClient = useMemo(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 24 * 60 * 60 * 1000,
						gcTime: 7 * 24 * 60 * 60 * 1000,
						refetchOnReconnect: true,
						refetchOnWindowFocus: false,
					},
				},
			}),
		[],
	)

	const persister = useMemo(
		() =>
			createAsyncStoragePersister({
				storage: AsyncStorage,
				throttleTime: 1000,
			}),
		[],
	)

	return (
		<PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</PersistQueryClientProvider>
	)
}


