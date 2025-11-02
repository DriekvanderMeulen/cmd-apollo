import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { TenantSelection } from "@/components/auth";
import { getAvailableTenants } from "@/server/auth/actions";

async function SelectTenantPage() {
  const cookieStore = await cookies();
  const pendingUserDataCookie = cookieStore.get("pending_user_data");

  // Redirect if no pending registration
  if (!pendingUserDataCookie) {
    return redirect("/login");
  }

  const pendingUserData = JSON.parse(pendingUserDataCookie.value);
  const { tenants, error } = await getAvailableTenants();

  if (error) {
    return (
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-red-600">Error</h1>
        <p className="text-neutral-600 text-sm">{error}</p>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900">
          No Tenants Available
        </h1>
        <p className="text-neutral-600 text-sm">
          There are no tenants available for registration. Please contact an
          administrator.
        </p>
      </div>
    );
  }

  return (
    <TenantSelection tenants={tenants} userEmail={pendingUserData.email} />
  );
}

export default SelectTenantPage;
