import { index, serial, pgTable, unique, varchar } from "drizzle-orm/pg-core";

import { nanoid } from "../id";

export const categoryTable = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
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
    publicIdIndex: index("categories_public_id_index").on(t.publicId),
  }),
);
