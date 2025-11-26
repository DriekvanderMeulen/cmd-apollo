"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { Dropdown, Spinner, Button, Input, Select, Badge } from "@/components/ui";
import {
  updateUserRole,
  deleteUser,
  suspendUserSessions,
  type UserWithSessionCount,
} from "@/server/admin/actions";
import { cn } from "@/utils";

interface UserManagementTableProps {
  users: UserWithSessionCount[];
  searchTerm?: string;
  sortBy?: "name" | "email" | "role";
  sortOrder?: "asc" | "desc";
  roleFilter?: "ADMIN" | "EDITOR" | "USER";
  page?: number;
}

interface UserRowProps {
  user: UserWithSessionCount;
}

const roleColors: Record<"ADMIN" | "EDITOR" | "USER", "destructive" | "warning" | "neutral"> = {
  ADMIN: "destructive",
  EDITOR: "warning",
  USER: "neutral",
};

function UserRow({ user }: UserRowProps) {
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleRoleChange = (newRole: "ADMIN" | "EDITOR" | "USER") => {
    setActiveAction("role");
    startTransition(async () => {
      const result = await updateUserRole(user.id, newRole);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`User role updated to ${newRole}`);
      }
      setActiveAction(null);
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        `Are you sure you want to delete ${user.email}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setActiveAction("delete");
    startTransition(async () => {
      const result = await deleteUser(user.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User deleted successfully");
      }
      setActiveAction(null);
    });
  };

  const handleSuspendSessions = () => {
    setActiveAction("suspend");
    startTransition(async () => {
      const result = await suspendUserSessions(user.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User sessions suspended successfully");
      }
      setActiveAction(null);
    });
  };

  const canModify = user.role !== "ADMIN";

  const dropdownItems = [
    {
      label: "Change to User",
      onClick: () => handleRoleChange("USER"),
      disabled: !canModify || user.role === "USER",
    },
    {
      label: "Change role to Editor",
      onClick: () => handleRoleChange("EDITOR"),
      disabled: !canModify || user.role === "EDITOR",
    },
    {
      label: "Change role to Admin",
      onClick: () => handleRoleChange("ADMIN"),
    },
    {
      label: "Suspend Sessions",
      onClick: handleSuspendSessions,
      disabled: !canModify || user.sessionCount === 0,
    },
    {
      label: "Delete User",
      onClick: handleDelete,
      isDanger: true,
      disabled: !canModify,
    },
  ].filter((item) => !item.disabled);

  return (
    <tr className="border-b border-neutral-200/60 hover:bg-neutral-50/50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center space-x-3">
          {user.pictureUrl ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user.pictureUrl}
              alt={`${user.givenName} ${user.familyName}`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white text-xs font-semibold capitalize">
              {user.givenName?.[0] || user.email[0]}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-neutral-800">
              {user.givenName && user.familyName
                ? `${user.givenName} ${user.familyName}`
                : user.email}
            </div>
            {user.givenName && user.familyName && (
              <div className="text-xs text-neutral-500">{user.email}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <Badge variant={roleColors[user.role]}>{user.role}</Badge>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center space-x-1.5">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              user.emailVerified ? "bg-green-500" : "bg-neutral-400",
            )}
          />
          <span className="text-sm text-neutral-600">
            {user.emailVerified ? "Verified" : "Unverified"}
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-sm text-neutral-600">
        {user.sessionCount} active session{user.sessionCount !== 1 ? "s" : ""}
      </td>
      <td className="px-5 py-3.5">
        {canModify ? (
          <Dropdown
            trigger={
              <Button variant="ghost" size="icon" disabled={isPending}>
                {isPending && activeAction ? (
                  <Spinner size={16} />
                ) : (
                  <MoreHorizontal size={18} />
                )}
              </Button>
            }
            items={dropdownItems}
            align="end"
          />
        ) : (
          <span className="text-xs text-neutral-400 font-medium">
            Protected
          </span>
        )}
      </td>
    </tr>
  );
}

export function UserManagementTable({
  users,
  searchTerm,
  sortBy,
  sortOrder,
  roleFilter,
  page = 1,
}: UserManagementTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchTerm || "");

  const updateUrl = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl("q", searchInput || null);
    updateUrl("page", "1");
  };

  const handleSort = (column: "name" | "email" | "role") => {
    const newOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", column);
    params.set("order", newOrder);
    params.set("page", "1");
    router.push(`/admin/users?${params.toString()}`);
  };

  const getSortIcon = (column: "name" | "email" | "role") => {
    if (sortBy !== column)
      return <ChevronsUpDown size={16} className="text-neutral-400" />;
    return sortOrder === "asc" ? (
      <ChevronUp size={16} className="text-neutral-700" />
    ) : (
      <ChevronDown size={16} className="text-neutral-700" />
    );
  };

  const pageNum = page;
  const setPage = (p: number) => updateUrl("page", String(p));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-80">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <Search size={18} />
          </div>
          <Input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
            placeholder="Search users..."
          />
        </form>

        <div className="flex items-center space-x-3 w-40">
          <Select
            value={roleFilter || ""}
            onChange={(e) => updateUrl("role", e.target.value || null)}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="EDITOR">Editor</option>
            <option value="USER">User</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-neutral-50/60 border-b border-neutral-200">
            <tr>
              <th
                className="cursor-pointer select-none px-5 py-3 text-left text-xs font-semibold text-neutral-600 hover:bg-neutral-100/50 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center space-x-1">
                  <span>User</span>
                  {getSortIcon("name")}
                </div>
              </th>
              <th
                className="cursor-pointer select-none px-5 py-3 text-left text-xs font-semibold text-neutral-600 hover:bg-neutral-100/50 transition-colors"
                onClick={() => handleSort("role")}
              >
                <div className="flex items-center space-x-1">
                  <span>Role</span>
                  {getSortIcon("role")}
                </div>
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
                Sessions
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-neutral-500"
                >
                  {searchTerm || roleFilter
                    ? "No users found matching your criteria."
                    : "No users found."}
                </td>
              </tr>
            ) : (
              users.map((user) => <UserRow key={user.id} user={user} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-neutral-600">
        <span>
          Showing {users.length} user{users.length !== 1 ? "s" : ""}
          {(searchTerm || roleFilter) && " matching your criteria"}
        </span>
        <div className="flex items-center space-x-4">
          <span>
            {users.filter((u) => u.role === "ADMIN").length} Admin
            {users.filter((u) => u.role === "ADMIN").length !== 1 ? "s" : ""}
          </span>
          <span>
            {users.filter((u) => u.role === "EDITOR").length} Editor
            {users.filter((u) => u.role === "EDITOR").length !== 1 ? "s" : ""}
          </span>
          <span>
            {users.filter((u) => u.role === "USER").length} User
            {users.filter((u) => u.role === "USER").length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPage(Math.max(1, pageNum - 1))}
          disabled={pageNum <= 1}
        >
          Prev
        </Button>
        <span className="text-sm">Page {pageNum}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPage(pageNum + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
