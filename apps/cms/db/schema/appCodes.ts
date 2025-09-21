// db/schema/appCodes.ts
import { mysqlTable, varchar, datetime, index, int } from 'drizzle-orm/mysql-core'
import { userTable } from './user'

export const appCodes = mysqlTable(
	'app_codes',
	{
		code: varchar('code', { length: 64 }).primaryKey(),
		userId: int('user_id').notNull().references(() => userTable.id),
		expiresAt: datetime('expires_at').notNull()
	},
	(table) => ({
		expiresIdx: index('app_codes_expires_idx').on(table.expiresAt)
	})
)
