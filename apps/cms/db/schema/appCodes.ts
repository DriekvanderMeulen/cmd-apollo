// db/schema/appCodes.ts
import {
  pgTable,
  varchar,
  timestamp,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { userTable } from "./user";

export const appCodes = pgTable(
  "app_codes",
  {
    code: varchar("code", { length: 64 }).primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => userTable.id),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => ({
    expiresIdx: index("app_codes_expires_idx").on(table.expiresAt),
  }),
);
