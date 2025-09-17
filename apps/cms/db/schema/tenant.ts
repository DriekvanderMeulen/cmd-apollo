import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { cuid } from "../id";

export const tenantTable = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  publicId: varchar("public_id", {
    length: 255,
  })
    .notNull()
    .$defaultFn(() => cuid()),
  name: varchar("name", {
    length: 255,
  }).notNull(),
});
