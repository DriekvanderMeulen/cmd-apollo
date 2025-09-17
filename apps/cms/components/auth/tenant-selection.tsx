'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui'
import { completeTenantRegistration } from '@/server/auth/actions'

interface TenantOption {
	id: number
	name: string
}

interface TenantSelectionProps {
	tenants: Array<TenantOption>
	userEmail: string
}

function TenantSelection({ tenants, userEmail }: TenantSelectionProps) {
	const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null)
	const [currentPage, setCurrentPage] = useState(0)
	const [isPending, startTransition] = useTransition()
	const router = useRouter()

	const TENANTS_PER_PAGE = 6

	// Extract year from tenant name (format: CMD-[A-C]-[YYYY])
	const extractYear = (name: string): number => {
		const match = name.match(/CMD-[A-C]-(\d{4})/)
		return match ? parseInt(match[1], 10) : 0
	}

	// Sort tenants by year (most recent first) and paginate
	const { sortedTenants, totalPages, currentPageTenants, currentPageYears } = useMemo(() => {
		const sorted = [...tenants].sort((a, b) => extractYear(b.name) - extractYear(a.name))
		const total = Math.ceil(sorted.length / TENANTS_PER_PAGE)
		const startIndex = currentPage * TENANTS_PER_PAGE
		const paginated = sorted.slice(startIndex, startIndex + TENANTS_PER_PAGE)
		
		// Get unique years for current page
		const years = [...new Set(paginated.map(tenant => extractYear(tenant.name)))]
			.sort((a, b) => b - a)
		
		return {
			sortedTenants: sorted,
			totalPages: total,
			currentPageTenants: paginated,
			currentPageYears: years
		}
	}, [tenants, currentPage])

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!selectedTenantId) {
			toast.error('Please select a tenant to continue')
			return
		}

		startTransition(async () => {
			try {
				const result = await completeTenantRegistration(selectedTenantId)
				
				if (result.error) {
					toast.error(result.error)
				} else {
					toast.success('Registration completed successfully!')
					router.push('/')
				}
			} catch (error) {
				toast.error('Something went wrong. Please try again.')
			}
		})
	}

	return (
		<div className="mx-auto max-w-md space-y-6">
			<div className="text-center">
				<h1 className="mb-2 text-3xl font-bold">Selecteer jouw klas</h1>
				<p className="text-gray-600">
					Selecteer jouw klas in het jaar dat je de opleiding begonnen bent.
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Pagination controls at top */}
				<div className="flex justify-between gap-4">
					<Button
						type="button"
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 0}
						className="flex-1"
					>
						← Vorige pagina
					</Button>
					<Button
						type="button"
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages - 1}
						className="flex-1"
					>
						Volgende pagina →
					</Button>
				</div>

				{/* Tenant list */}
				<div className="space-y-3">
					{currentPageTenants.map((tenant) => (
						<label
							key={tenant.id}
							className={`block cursor-pointer rounded-ui border-2 p-4 transition-colors ${
								selectedTenantId === tenant.id
									? 'border-blue-500 bg-blue-50'
									: 'border-gray-200 hover:border-gray-300'
							}`}
						>
							<input
								type="radio"
								name="tenant"
								value={tenant.id}
								checked={selectedTenantId === tenant.id}
								onChange={() => setSelectedTenantId(tenant.id)}
								className="sr-only"
							/>
							<div className="flex items-center justify-between">
								<span className="font-medium text-gray-900">{tenant.name}</span>
								<div
									className={`h-4 w-4 rounded-full border-2 ${
										selectedTenantId === tenant.id
											? 'border-blue-500 bg-blue-500'
											: 'border-gray-300'
									}`}
								>
									{selectedTenantId === tenant.id && (
										<div className="h-full w-full rounded-full bg-white p-0.5">
											<div className="h-full w-full rounded-full bg-blue-500" />
										</div>
									)}
								</div>
							</div>
						</label>
					))}
				</div>

				{/* Fullwidth confirm button */}
				<Button
					type="submit"
					className="w-full py-3 text-lg font-semibold"
					isLoading={isPending}
					disabled={!selectedTenantId}
				>
					{isPending ? 'Bezig...' : 'Bevestigen'}
				</Button>
			</form>
		</div>
	)
}

export default TenantSelection
