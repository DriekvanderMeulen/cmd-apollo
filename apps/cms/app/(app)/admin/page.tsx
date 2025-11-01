import { redirect } from "next/navigation";

import { validateRequest } from "@/server/auth/validate";
import Link from "next/link";

async function AdminPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/editor");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Admin Dashboard
        </h1>
        <p className="text-neutral-600 mt-1.5 text-[15px]">
          Welcome back, {user.givenName}. Manage your platform from here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/users"
          className="rounded-lg border border-neutral-200 bg-white p-6 hover:border-neutral-300 hover:shadow-sm transition-all"
        >
          <h2 className="text-lg font-semibold mb-2 text-neutral-900">
            User Management
          </h2>
          <p className="text-neutral-600 text-sm">
            Manage user accounts, roles, and permissions across the platform.
          </p>
        </Link>

        <Link
          href="/admin/health"
          className="rounded-lg border border-neutral-200 bg-white p-6 hover:border-neutral-300 hover:shadow-sm transition-all"
        >
          <h2 className="text-lg font-semibold mb-2 text-neutral-900">
            System Overview
          </h2>
          <p className="text-neutral-600 text-sm">
            View system statistics and monitor platform health.
          </p>
        </Link>
      </div>
    </div>
  );
}

export default AdminPage;
