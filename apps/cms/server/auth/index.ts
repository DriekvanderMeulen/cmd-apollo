import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";

import { db } from "@/db";
import { sessionTable, userTable } from "@/db/schema";

const adapter = new DrizzleMySQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      id: attributes.id,
      email: attributes.email,
      givenName: attributes.givenName,
      familyName: attributes.familyName,
      picture: attributes.pictureUrl,
      tenantId: attributes.tenantId,
      emailVerified: attributes.emailVerified,
      role: attributes.role,
    };
  },
});

interface DatabaseUserAttributes {
  id: number;
  email: string;
  givenName: string;
  familyName: string;
  pictureUrl: string | null;
  tenantId: number;
  emailVerified: boolean;
  role: "ADMIN" | "EDITOR" | "USER";
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
    UserId: number;
  }
}

export { validateRequest } from "./validate";
