import {
  index,
  integer,
  serial,
  pgTable,
  text,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

import { objectTable } from "./object";

export const iterationTable = pgTable(
  "iterations",
  {
    id: serial("id").primaryKey(),
    objectId: integer("object_id")
      .notNull()
      .references(() => objectTable.id, { onDelete: "cascade" }),
    title: varchar("title", {
      length: 255,
    }).notNull(),
    date: timestamp("date").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    objectIdIndex: index("iterations_object_id_index").on(t.objectId),
  }),
);
