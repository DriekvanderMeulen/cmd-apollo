import {
    boolean,
    datetime,
    index,
    int,
    mysqlEnum,
    mysqlTable,
    text,
    unique,
    varchar,
  } from "drizzle-orm/mysql-core";
  
  import { cuid } from "../id";
  import { tenantTable } from "./tenant";
  
  export const userTable = mysqlTable(
    "users",
    {
      id: int("id").autoincrement().primaryKey(),
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
      tenantId: int("tenant_id")
        .notNull()
        .references(() => tenantTable.id, { onDelete: "cascade" }),
      pictureUrl: text("picture_url"),
      emailVerified: boolean("email_verified").default(false),
      role: mysqlEnum("role", ["ADMIN", "EDITOR", "USER"]).default("USER"),
    },
    (t) => ({
      uniquePublicId: unique().on(t.publicId, t.tenantId),
      publicIdIndex: index("public_id_index").on(t.publicId),
    }),
  );
  
  export const sessionTable = mysqlTable("sessions", {
    id: varchar("id", {
      length: 255,
    }).primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    expiresAt: datetime("expires_at").notNull(),
  });
  
  export const oAuthAccountsTable = mysqlTable("oauth_accounts", {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    provider: mysqlEnum("oauth_provider", ["GOOGLE"]),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    expiresAt: datetime("expires_at").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    scopes: text("scopes"),
    idToken: text("id_token"),
  });
  
  export const verificationTokensTable = mysqlTable("verification_tokens", {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    hashedToken: varchar("hashed_token", {
      length: 255,
    }).notNull(),
    expiresAt: datetime("expires_at").notNull(),
  });
  