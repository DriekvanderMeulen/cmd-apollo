// lib/authContext.ts
import { cookies } from "next/headers";
import { lucia } from "@/server/auth";

export interface AuthContext {
  userId: number;
  sessionId: string;
}

function getBearer(req: Request): string | null {
  const v = req.headers.get("authorization") || "";
  return v.startsWith("Bearer ") ? v.slice(7) : null;
}

export async function requireAuthContext(req: Request): Promise<AuthContext> {
  const jar = await cookies();
  const cookieId = jar.get(lucia.sessionCookieName)?.value || null;
  const bearerId = getBearer(req);
  const sessionId = bearerId ?? cookieId;
  if (!sessionId) throw new Response("Unauthorized", { status: 401 });

  const { session } = await lucia
    .validateSession(sessionId)
    .catch(() => ({ session: null }));
  if (!session) throw new Response("Unauthorized", { status: 401 });

  return { userId: session.userId as number, sessionId };
}
