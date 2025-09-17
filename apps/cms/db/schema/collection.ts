import {
    index,
    int,
    mysqlTable,
    unique,
    varchar,
  } from "drizzle-orm/mysql-core";
  
  import { nanoid } from "../id";
  import { tenantTable } from "./tenant";
  
  export const collectionTable = mysqlTable(
    "collections",
    {
      id: int("id").autoincrement().primaryKey(),
      publicId: varchar("public_id", {
        length: 255,
      })
        .notNull()
        .$defaultFn(() => nanoid()),
      tenantId: int("tenant_id")
        .notNull()
        .references(() => tenantTable.id, { onDelete: "cascade" }),
      title: varchar("title", {
        length: 255,
      }).notNull(),
    },
    (t) => ({
      uniquePublicId: unique().on(t.publicId, t.tenantId),
      publicIdIndex: index("public_id_index").on(t.publicId),
    }),
  );
  