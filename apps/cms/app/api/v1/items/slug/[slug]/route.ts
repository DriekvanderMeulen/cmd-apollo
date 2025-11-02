import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { objectTable } from "@/db/schema/object";
import { iterationTable } from "@/db/schema/iteration";

type SlugParams = Promise<{ slug: string }>;

export async function GET(request: NextRequest, { params }: { params: SlugParams }) {
  const { slug } = await params;
  const item = await loadItem(slug);
  if (!item) {
    return withCors(request, NextResponse.json({ error: "Not found" }, { status: 404 }));
  }
  return withCors(request, NextResponse.json(item));
}

export function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
  return withCors(request, response);
}

async function loadItem(slug: string) {
  const rows = await db
    .select({
      id: objectTable.id,
      publicId: objectTable.publicId,
      title: objectTable.title,
      description: objectTable.description,
      collectionId: objectTable.collectionId,
      userId: objectTable.userId,
      cfR2Link: objectTable.cfR2Link,
      videoR2Key: objectTable.videoR2Key,
    })
    .from(objectTable)
    .where(and(eq(objectTable.publicId, slug), eq(objectTable.public, true)))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }

  const iterationsRaw = await db
    .select({
      id: iterationTable.id,
      title: iterationTable.title,
      description: iterationTable.description,
      date: iterationTable.date,
    })
    .from(iterationTable)
    .where(eq(iterationTable.objectId, row.id))
    .orderBy(asc(iterationTable.createdAt));

  const basePath = row.cfR2Link || `${row.collectionId}/${row.userId}`;

  const iterations = iterationsRaw.map((iteration, index) => ({
    id: String(iteration.id),
    order: index + 1,
    title: iteration.title,
    summary: extractPlainText(iteration.description),
    videoKey: row.videoR2Key || (basePath ? `${basePath}/${index + 1}` : null),
    posterKey: null,
  }));

  const updatedAtSource =
    iterationsRaw[iterationsRaw.length - 1]?.date || iterationsRaw[0]?.date || new Date();

  return {
    id: row.publicId,
    slug: row.publicId,
    title: row.title,
    summary: extractPlainText(row.description),
    iterations,
    updatedAt: updatedAtSource.toISOString(),
  };
}

function extractPlainText(value: any): string {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(extractPlainText).join(" ").trim();
  }
  if (typeof value === "object") {
    if (typeof value.text === "string") {
      return value.text;
    }
    if (Array.isArray((value as any).content)) {
      return (value as any).content.map(extractPlainText).join(" ").trim();
    }
  }
  return "";
}

function withCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();
  const allowValue = origin && allowedOrigins.has(origin) ? origin : "*";

  response.headers.set("Access-Control-Allow-Origin", allowValue);
  if (allowValue !== "*") {
    response.headers.set("Vary", "Origin");
  }

  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  return response;
}

function getAllowedOrigins(): Set<string> {
  const entries = [
    process.env.NEXT_PUBLIC_WEB_APP_BASE_URL,
    process.env.NEXT_PUBLIC_UNIVERSAL_LINK_BASE,
  ];

  const normalized = entries
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return value;
      }
    });

  return new Set(normalized);
}

