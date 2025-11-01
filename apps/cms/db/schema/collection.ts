import {
  index,
  integer,
  serial,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

import { nanoid } from "../id";
import { tenantTable } from "./tenant";

export const collectionTable = pgTable(
  "collections",
  {
    id: serial("id").primaryKey(),
    publicId: varchar("public_id", {
      length: 255,
    })
      .notNull()
      .$defaultFn(() => nanoid()),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenantTable.id, { onDelete: "cascade" }),
    title: varchar("title", {
      length: 255,
    }).notNull(),
  },
  (t) => ({
    uniquePublicId: unique().on(t.publicId, t.tenantId),
    publicIdIndex: index("collections_public_id_index").on(t.publicId),
  }),
);
