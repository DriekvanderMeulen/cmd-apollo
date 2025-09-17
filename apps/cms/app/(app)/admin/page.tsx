import { redirect } from "next/navigation"

import { validateRequest } from "@/server/auth/validate"
import { ButtonLink } from "@/components/ui"

async function AdminPage() {
	const { user } = await validateRequest()
	
	if (!user) {
		redirect("/login")
	}
	
	if (user.role !== "ADMIN") {
		redirect("/editor")
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Admin Dashboard</h1>
				<p className="text-neutral-600 mt-1">
					Welcome back, {user.givenName}. Manage your platform from here.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="rounded-ui border border-neutral-200 bg-white p-6">
					<h2 className="text-lg font-semibold mb-2">User Management</h2>
					<p className="text-neutral-600 mb-4">
						Manage user accounts, roles, and permissions across the platform.
					</p>
					<ButtonLink 
						href="/admin/users" 
						title="Manage Users" 
						variant="primary"
					/>
				</div>

				<div className="rounded-ui border border-neutral-200 bg-white p-6">
					<h2 className="text-lg font-semibold mb-2">System Overview</h2>
					<p className="text-neutral-600 mb-4">
						View system statistics and monitor platform health.
					</p>
					<ButtonLink 
						href="/admin/system" 
						title="View System" 
						variant="secondary-gray"
					/>
				</div>
			</div>
		</div>
	)
}

export default AdminPage
