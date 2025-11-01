import { serial, pgTable, varchar } from "drizzle-orm/pg-core";

import { cuid } from "../id";

export const tenantTable = pgTable("tenants", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", {
    length: 255,
  })
    .notNull()
    .$defaultFn(() => cuid()),
  name: varchar("name", {
    length: 255,
  }).notNull(),
});
