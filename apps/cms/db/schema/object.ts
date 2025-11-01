import {
  index,
  integer,
  serial,
  pgTable,
  text,
  unique,
  varchar,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

import { nanoid } from "../id";
import { categoryTable } from "./category";
import { collectionTable } from "./collection";
import { userTable } from "./user";

export const objectTable = pgTable(
  "objects",
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
    description: jsonb("description"),
    userId: integer("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    collectionId: integer("collection_id")
      .notNull()
      .references(() => collectionTable.id, { onDelete: "cascade" }),
    categoryId: integer("category_id").references(() => categoryTable.id, {
      onDelete: "cascade",
    }),
    cfR2Link: text("cf_r2_link"),
    videoR2Key: text("video_r2_key"),
    public: boolean("public").notNull().default(false),
  },
  (t) => ({
    uniquePublicId: unique().on(t.publicId),
    publicIdIndex: index("objects_public_id_index").on(t.publicId),
  }),
);
