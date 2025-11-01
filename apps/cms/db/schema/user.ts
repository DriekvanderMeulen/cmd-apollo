import {
  boolean,
  timestamp,
  index,
  integer,
  serial,
  pgEnum,
  pgTable,
  text,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

import { cuid } from "../id";
import { tenantTable } from "./tenant";

export const roleEnum = pgEnum("role", ["ADMIN", "EDITOR", "USER"]);
export const oauthProviderEnum = pgEnum("oauth_provider", ["GOOGLE"]);

export const userTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    publicId: varchar("public_id", {
      length: 255,
    })
      .notNull()
      .$defaultFn(() => cuid()),
    email: varchar("email", {
      length: 255,
    })
      .unique()
      .notNull(),
    givenName: varchar("given_name", {
      length: 255,
    }),
    familyName: varchar("family_name", {
      length: 255,
    }),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenantTable.id, { onDelete: "cascade" }),
    pictureUrl: text("picture_url"),
    emailVerified: boolean("email_verified").default(false),
    role: roleEnum("role").default("USER"),
  },
  (t) => ({
    uniquePublicId: unique().on(t.publicId, t.tenantId),
    publicIdIndex: index("users_public_id_index").on(t.publicId),
  }),
);

export const sessionTable = pgTable("sessions", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const oAuthAccountsTable = pgTable("oauth_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  provider: oauthProviderEnum("oauth_provider"),
  providerAccountId: varchar("provider_account_id", {
    length: 255,
  }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  scopes: text("scopes"),
  idToken: text("id_token"),
});

export const verificationTokensTable = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  hashedToken: varchar("hashed_token", {
    length: 255,
  }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});
