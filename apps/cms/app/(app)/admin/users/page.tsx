import { redirect } from "next/navigation"

import { validateRequest } from "@/server/auth/validate"
import { getAllUsers } from "@/server/admin/actions"
import { UserManagementTable } from "@/components/admin/user-management-table"

interface AdminUsersPageProps {
	searchParams: Promise<{
		q?: string
		sort?: "name" | "email" | "role"
		order?: "asc" | "desc" 
		role?: "ADMIN" | "EDITOR" | "USER"
	}>
}

async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
	const { user } = await validateRequest()
	
	if (!user) {
		redirect("/login")
	}
	
	if (user.role !== "ADMIN") {
		redirect("/editor")
	}

	const params = await searchParams
	const users = await getAllUsers(
		params.q,
		params.sort,
		params.order,
		params.role
	)

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">User Management</h1>
				<p className="text-neutral-600 mt-1">
					Manage user accounts, roles, and sessions across the platform.
				</p>
			</div>
			
			<UserManagementTable 
				users={users} 
				searchTerm={params.q}
				sortBy={params.sort}
				sortOrder={params.order}
				roleFilter={params.role}
			/>
		</div>
	)
}

export default AdminUsersPage
