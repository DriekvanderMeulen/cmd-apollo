import { redirect } from "next/navigation";

import { validateRequest } from "@/server/auth/validate";

interface HealthCheckItemProps {
  label: string;
  status: string;
  details?: Record<string, unknown>;
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "ok"
      ? "bg-green-100 text-green-800"
      : status === "error"
        ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {status}
    </span>
  );
}

function HealthCheckItem({ label, status, details }: HealthCheckItemProps) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div>
        <div className="font-semibold text-neutral-900">{label}</div>
        {details ? (
          <pre className="mt-1.5 text-xs text-neutral-500 whitespace-pre-wrap">
            {JSON.stringify(details, null, 2)}
          </pre>
        ) : null}
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

async function AdminHealthPage() {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "ADMIN") {
    redirect("/editor");
  }

  const res = await fetch(
    `${process.env.VERCEL ? "https://cms.apolloview.app" : "http://localhost:3000"}/api/v1/health`,
    {
      next: { revalidate: 0 },
      cache: "no-store",
    },
  );
  const data = (await res.json()) as {
    status: string;
    checks: Record<
      string,
      { status: string; details?: Record<string, unknown> }
    >;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-900">
          System Health
        </h1>
        <p className="text-neutral-600 mt-1.5 text-[15px]">
          Overview of critical service health checks.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="font-semibold text-neutral-900">Overall</div>
        <StatusBadge status={data.status} />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {Object.entries(data.checks).map(([key, value]) => (
          <HealthCheckItem
            key={key}
            label={key}
            status={value.status}
            details={value.details}
          />
        ))}
      </div>
    </div>
  );
}

export default AdminHealthPage;
