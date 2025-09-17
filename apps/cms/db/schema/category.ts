import {
    index,
    int,
    mysqlTable,
    unique,
    varchar,
  } from "drizzle-orm/mysql-core";
  
  import { nanoid } from "../id";
  
  export const categoryTable = mysqlTable(
    "categories",
    {
      id: int("id").autoincrement().primaryKey(),
      publicId: varchar("public_id", {
        length: 255,
      })
        .notNull()
        .$defaultFn(() => nanoid()),
      title: varchar("title", {
        length: 255,
      }).notNull(),
    },
    (t) => ({
      uniquePublicId: unique().on(t.publicId),
      publicIdIndex: index("public_id_index").on(t.publicId),
    }),
  );
  