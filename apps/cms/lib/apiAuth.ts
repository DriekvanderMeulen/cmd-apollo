// lib/apiAuth.ts
import { lucia } from "@/server/auth";

export async function requireSession(req: Request) {
  const value = req.headers.get("authorization") || "";
  const sessionId = value.startsWith("Bearer ") ? value.slice(7) : null;
  if (!sessionId) {
    return { ok: false as const, status: 401, error: "Missing token" };
  }

  try {
    const { user, session } = await lucia.validateSession(sessionId);
    if (!session) {
      return { ok: false as const, status: 401, error: "Invalid session" };
    }
    return { ok: true as const, user, session };
  } catch {
    return { ok: false as const, status: 401, error: "Invalid session" };
  }
}
