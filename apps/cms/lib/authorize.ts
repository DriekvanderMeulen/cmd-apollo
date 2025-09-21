// lib/authorize.ts
import { type AuthContext } from '@/lib/authContext'

export function assertTenantAccess(auth: AuthContext, tenantId: number): void {
	if (auth.user.tenantId !== tenantId) {
		throw new Response('Forbidden', { status: 403 })
	}
}

export function assertRoleAtLeast(auth: AuthContext, min: 'USER' | 'EDITOR' | 'ADMIN'): void {
	const order = { USER: 1, EDITOR: 2, ADMIN: 3 }
	order[auth.user.role] >= order[min] ? null : (() => { throw new Response('Forbidden', { status: 403 }) })()
}
