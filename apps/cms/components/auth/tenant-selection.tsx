'use client'

import { useState, useMemo, useEffect } from 'react'
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
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const [authString, setAuthString] = useState('')
	const [authError, setAuthError] = useState<string | null>(null)

	const TENANTS_PER_PAGE = 3

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
		// Clamp within bounds to avoid empty pages
		setCurrentPage((prev) => {
			const next = Math.max(0, Math.min(newPage, totalPages - 1))
			return next
		})
	}

	// If tenants change or pages shrink, keep currentPage within bounds
	useEffect(() => {
		setCurrentPage((prev) => {
			const maxIndex = Math.max(0, totalPages - 1)
			return Math.min(prev, maxIndex)
		})
	}, [totalPages])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setAuthError(null)
		
		if (!selectedTenantId) {
			toast.error('Please select a tenant to continue')
			return
		}

		if (!authString) {
			setAuthError('Voer de autorisatiesleutel in')
			toast.error('Voer de autorisatiesleutel in')
			return
		}

		setIsSubmitting(true)
		try {
			const result = await completeTenantRegistration(selectedTenantId, authString)
			
			if (result.error) {
				// Show inline error for invalid auth key; toast for other errors
				if (result.error.toLowerCase().includes('autorisatiesleutel')) {
					setAuthError(result.error)
				} else {
					toast.error(result.error)
				}
			} else {
				toast.success('Registration completed successfully!')
				router.push('/')
			}
		} catch (error) {
			toast.error('Something went wrong. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
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
						className="flex-1 text-sm cursor-pointer"
					>
						← Vorige
					</Button>
					<Button
						type="button"
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages - 1}
						className="flex-1 text-sm cursor-pointer"
					>
						Volgende →
					</Button>
				</div>

				{/* Tenant list */}
				<div className="space-y-3">
					{currentPageTenants.map((tenant) => (
						<label
							key={tenant.id}
							className={`block cursor-pointer rounded-[8px] border-2 p-4 transition-colors ${
								selectedTenantId === tenant.id
									? 'border-yellow-500 bg-yellow-50'
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
											? 'border-yellow-500 bg-yellow-500'
											: 'border-gray-300'
									}`}
								>
									{selectedTenantId === tenant.id && (
										<div className="h-full w-full rounded-full bg-white p-0.5">
											<div className="h-full w-full rounded-full bg-yellow-500" />
										</div>
									)}
								</div>
							</div>
						</label>
					))}
				</div>

				{/* Fullwidth confirm button */}
				<div className="space-y-3">
				<input
						type="password"
						value={authString}
					onChange={(e) => {
						setAuthError(null)
						setAuthString(e.target.value)
					}}
						placeholder="Autorisatiesleutel"
					className={`w-full rounded-[8px] border p-3 ${authError ? 'border-red-500 focus:outline-red-600' : 'border-gray-300'}`}
					aria-invalid={authError ? 'true' : 'false'}
						autoComplete="off"
					/>
				{authError ? (
					<p className="text-sm text-red-600">{authError}</p>
				) : null}
					<Button
						type="submit"
					className="w-full border-black border cursor-pointer py-3 text-lg font-semibold"
					isLoading={isSubmitting}
						disabled={!selectedTenantId}
					>
					{isSubmitting ? 'Bezig...' : 'Bevestigen'}
					</Button>
				</div>
			</form>
		</div>
	)
}

export default TenantSelection
