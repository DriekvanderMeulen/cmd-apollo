// lib/authorize.ts
export function assertTenantAccess(user: any, tenantId: number): void {
  if (user.tenantId !== tenantId) {
    throw new Response("Forbidden", { status: 403 });
  }
}

export function assertRoleAtLeast(
  user: any,
  min: "USER" | "EDITOR" | "ADMIN",
): void {
  const order = { USER: 1, EDITOR: 2, ADMIN: 3 } as const;
  const userRole = user.role as keyof typeof order;
  order[userRole] >= order[min]
    ? null
    : (() => {
        throw new Response("Forbidden", { status: 403 });
      })();
}
