import { redirect } from "next/navigation"

import { validateRequest } from "@/server/auth/validate"
import Link from "next/link"

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
				<Link href="/admin/users" className="rounded-[8px] border border-neutral-200 bg-white p-6">
					<h2 className="text-lg font-semibold mb-2">User Management</h2>
					<p className="text-neutral-600 mb-4">
						Manage user accounts, roles, and permissions across the platform.
					</p>
				</Link>

				<Link href="/admin/health" className="rounded-[8px] border border-neutral-200 bg-white p-6">
					<h2 className="text-lg font-semibold mb-2">System Overview</h2>
					<p className="text-neutral-600 mb-4">
						View system statistics and monitor platform health.
					</p>
				</Link>
			</div>
		</div>
	)
}

export default AdminPage
