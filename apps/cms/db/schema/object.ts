import {
	index,
	int,
	mysqlTable,
	text,
	unique,
	varchar,
} from 'drizzle-orm/mysql-core'

import { nanoid } from '../id'
import { categoryTable } from './category'
import { collectionTable } from './collection'
import { userTable } from './user'

export const objectTable = mysqlTable(
	'objects',
	{
		id: int('id').autoincrement().primaryKey(),
		publicId: varchar('public_id', {
			length: 255,
		})
			.notNull()
			.$defaultFn(() => nanoid()),
		title: varchar('title', {
			length: 255,
		}).notNull(),
		description: text('description'),
		userId: int('user_id')
			.notNull()
			.references(() => userTable.id, { onDelete: 'cascade' }),
		collectionId: int('collection_id')
			.notNull()
			.references(() => collectionTable.id, { onDelete: 'cascade' }),
		categoryId: int('category_id')
			.references(() => categoryTable.id, { onDelete: 'cascade' }),
		cfR2Link: text('cf_r2_link'),
	},
	(t) => ({
		uniquePublicId: unique().on(t.publicId),
		publicIdIndex: index('public_id_index').on(t.publicId),
	})
)
