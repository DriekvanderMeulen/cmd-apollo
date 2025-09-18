"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { HiMiniMagnifyingGlass, HiChevronUpDown, HiChevronUp, HiChevronDown, HiMiniEllipsisHorizontal } from "react-icons/hi2"
import { toast } from "react-hot-toast"

import { Dropdown, Spinner } from "@/components/ui"
import { updateUserRole, deleteUser, suspendUserSessions, type UserWithSessionCount } from "@/server/admin/actions"
import { cn } from "@/utils"

interface UserManagementTableProps {
    users: UserWithSessionCount[]
    searchTerm?: string
    sortBy?: "name" | "email" | "role"
    sortOrder?: "asc" | "desc"
    roleFilter?: "ADMIN" | "EDITOR" | "USER"
    page?: number
}

interface UserRowProps {
	user: UserWithSessionCount
}

const roleColors = {
	ADMIN: "bg-red-100 text-red-800",
	EDITOR: "bg-yellow-100 text-yellow-800", 
	USER: "bg-gray-100 text-gray-800",
}

function UserRow({ user }: UserRowProps) {
	const [isPending, startTransition] = useTransition()
	const [activeAction, setActiveAction] = useState<string | null>(null)

	const handleRoleChange = (newRole: "ADMIN" | "EDITOR" | "USER") => {
		setActiveAction("role")
		startTransition(async () => {
			const result = await updateUserRole(user.id, newRole)
			if (result.error) {
				toast.error(result.error)
			} else {
				toast.success(`User role updated to ${newRole}`)
			}
			setActiveAction(null)
		})
	}

	const handleDelete = () => {
		if (!confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
			return
		}
		
		setActiveAction("delete")
		startTransition(async () => {
			const result = await deleteUser(user.id)
			if (result.error) {
				toast.error(result.error)
			} else {
				toast.success("User deleted successfully")
			}
			setActiveAction(null)
		})
	}

	const handleSuspendSessions = () => {
		setActiveAction("suspend")
		startTransition(async () => {
			const result = await suspendUserSessions(user.id)
			if (result.error) {
				toast.error(result.error)
			} else {
				toast.success("User sessions suspended successfully")
			}
			setActiveAction(null)
		})
	}

	const canModify = user.role !== "ADMIN"

	const dropdownItems = [
		{
			label: "Change to User",
			onClick: () => handleRoleChange("USER"),
			disabled: !canModify || user.role === "USER"
		},
		{
			label: "Change role to Editor", 
			onClick: () => handleRoleChange("EDITOR"),
			disabled: !canModify || user.role === "EDITOR"
		},
		{
			label: "Change role to Admin", 
			onClick: () => handleRoleChange("ADMIN"),
		},
		{
			label: "Suspend Sessions",
			onClick: handleSuspendSessions,
			disabled: !canModify || user.sessionCount === 0
		},
		{
			label: "Delete User",
			onClick: handleDelete,
			isDanger: true,
			disabled: !canModify
		}
	].filter(item => !item.disabled)

	return (
		<tr className="border-b border-neutral-100 hover:bg-neutral-50">
			<td className="px-6 py-4">
				<div className="flex items-center space-x-3">
					{user.pictureUrl ? (
						<img
							className="h-8 w-8 rounded-full"
							src={user.pictureUrl}
							alt={`${user.givenName} ${user.familyName}`}
							referrerPolicy="no-referrer"
						/>
					) : (
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 font-semibold capitalize text-black">
							{user.givenName?.[0] || user.email[0]}
						</div>
					)}
					<div>
						<div className="font-semibold text-neutral-900">
							{user.givenName && user.familyName
								? `${user.givenName} ${user.familyName}`
								: user.email}
						</div>
						{user.givenName && user.familyName && (
							<div className="text-sm text-neutral-500">{user.email}</div>
						)}
					</div>
				</div>
			</td>
			<td className="px-6 py-4">
				<span
					className={cn(
						"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
						roleColors[user.role]
					)}
				>
					{user.role}
				</span>
			</td>
			<td className="px-6 py-4">
				<div className="flex items-center space-x-1">
					<div className={cn(
						"h-2 w-2 rounded-full",
						user.emailVerified ? "bg-green-400" : "bg-gray-400"
					)} />
					<span className="text-sm text-neutral-600">
						{user.emailVerified ? "Verified" : "Unverified"}
					</span>
				</div>
			</td>
			<td className="px-6 py-4 text-sm text-neutral-600">
				{user.sessionCount} active session{user.sessionCount !== 1 ? 's' : ''}
			</td>
			<td className="px-6 py-4">
				{canModify ? (
					<Dropdown
						trigger={
							<button 
								className="p-1 hover:bg-neutral-100  cursor-pointer rounded-[8px] disabled:opacity-50"
								disabled={isPending}
							>
								{isPending && activeAction ? (
									<Spinner size={16} />
								) : (
									<HiMiniEllipsisHorizontal size={16} />
								)}
							</button>
						}
						items={dropdownItems}
						align="end"
					/>
				) : (
					<span className="text-xs text-neutral-400">Protected</span>
				)}
			</td>
		</tr>
	)
}

export function UserManagementTable({ 
    users, 
    searchTerm, 
    sortBy, 
    sortOrder, 
    roleFilter,
    page = 1,
}: UserManagementTableProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [searchInput, setSearchInput] = useState(searchTerm || "")

    const updateUrl = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString())
		if (value) {
			params.set(key, value)
		} else {
			params.delete(key)
		}
		router.push(`/admin/users?${params.toString()}`)
	}

    const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
        updateUrl("q", searchInput || null)
        updateUrl("page", "1")
	}

	const handleSort = (column: "name" | "email" | "role") => {
		const newOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc"
		const params = new URLSearchParams(searchParams.toString())
		params.set("sort", column)
		params.set("order", newOrder)
        params.set("page", "1")
        router.push(`/admin/users?${params.toString()}`)
	}

	const getSortIcon = (column: "name" | "email" | "role") => {
		if (sortBy !== column) return <HiChevronUpDown size={16} className="text-neutral-400" />
		return sortOrder === "asc" 
			? <HiChevronUp size={16} className="text-neutral-700" />
			: <HiChevronDown size={16} className="text-neutral-700" />
	}

    const pageNum = page
    const setPage = (p: number) => updateUrl("page", String(p))

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex items-center justify-between">
				<form onSubmit={handleSearch} className="relative">
					<div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
						<HiMiniMagnifyingGlass size={18} />
					</div>
					<input
						type="search"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="h-11 w-80 rounded-[8px] pl-10 pr-3.5 border border-neutral-200 outline-offset-0 outline-neutral-950 placeholder:text-neutral-400"
						placeholder="Search users..."
					/>
				</form>

				<div className="flex items-center space-x-3">
					<select
						value={roleFilter || ""}
						onChange={(e) => updateUrl("role", e.target.value || null)}
						className="h-11 rounded-[8px] px-3 border border-neutral-200 outline-offset-0 outline-neutral-950"
					>
						<option value="">All Roles</option>
						<option value="ADMIN">Admin</option>
						<option value="EDITOR">Editor</option>
						<option value="USER">User</option>
					</select>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-[8px] border border-neutral-200 bg-white">
				<table className="min-w-full">
					<thead className="bg-neutral-50">
						<tr>
							<th 
								className="cursor-pointer select-none px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 hover:bg-neutral-100"
								onClick={() => handleSort("name")}
							>
								<div className="flex items-center space-x-1">
									<span>User</span>
									{getSortIcon("name")}
								</div>
							</th>
							<th 
								className="cursor-pointer select-none px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 hover:bg-neutral-100"
								onClick={() => handleSort("role")}
							>
								<div className="flex items-center space-x-1">
									<span>Role</span>
									{getSortIcon("role")}
								</div>
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
								Sessions
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{users.length === 0 ? (
							<tr>
								<td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
									{searchTerm || roleFilter ? "No users found matching your criteria." : "No users found."}
								</td>
							</tr>
						) : (
							users.map((user) => (
								<UserRow key={user.id} user={user} />
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Stats */}
			<div className="flex items-center justify-between text-sm text-neutral-600">
				<span>
					Showing {users.length} user{users.length !== 1 ? 's' : ''}
					{(searchTerm || roleFilter) && " matching your criteria"}
				</span>
                <div className="flex items-center space-x-4">
					<span>
						{users.filter(u => u.role === "ADMIN").length} Admin{users.filter(u => u.role === "ADMIN").length !== 1 ? 's' : ''}
					</span>
					<span>
						{users.filter(u => u.role === "EDITOR").length} Editor{users.filter(u => u.role === "EDITOR").length !== 1 ? 's' : ''}
					</span>
					<span>
						{users.filter(u => u.role === "USER").length} User{users.filter(u => u.role === "USER").length !== 1 ? 's' : ''}
					</span>
				</div>
			</div>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-2">
                <button className="p-1 rounded-[8px] hover:bg-neutral-100 cursor-pointer disabled:opacity-50" onClick={() => setPage(Math.max(1, pageNum - 1))} disabled={pageNum <= 1}>
                    Prev
                </button>
                <span className="text-sm">Page {pageNum}</span>
                <button className="p-1 rounded-[8px] hover:bg-neutral-100 cursor-pointer disabled:opacity-50" onClick={() => setPage(pageNum + 1)}>
                    Next
                </button>
            </div>
		</div>
	)
}
