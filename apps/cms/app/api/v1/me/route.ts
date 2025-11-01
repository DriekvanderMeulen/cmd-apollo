// app/api/v1/me/route.ts
import { lucia } from "@/server/auth";

function getBearer(req: Request): string | null {
  const value = req.headers.get("authorization") || "";
  return value.startsWith("Bearer ") ? value.slice(7) : null;
}

export async function GET(req: Request): Promise<Response> {
  const sessionId = getBearer(req);
  if (!sessionId) return new Response("Unauthorized", { status: 401 });

  try {
    const { user, session } = await lucia.validateSession(sessionId);
    if (!session) return new Response("Unauthorized", { status: 401 });
    return Response.json({
      userId: user.id,
      email: user.email,
      givenName: user.givenName,
      familyName: user.familyName,
      picture: user.picture,
      role: user.role,
      tenantId: user.tenantId,
    });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}
