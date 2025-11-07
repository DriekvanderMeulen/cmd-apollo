export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { db } from "@/db";
import { objectTable } from "@/db/schema";
import { validateRequest } from "@/server/auth/validate";
import { R2_BUCKET_NAME, createR2Client } from "@/server/clients/r2";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function buildVideoKey(collectionId: number, objectId: number): string {
  return `${collectionId}/${objectId}/video`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { publicId } = await params;
  const rows = await db
    .select()
    .from(objectTable)
    .where(
      and(eq(objectTable.publicId, publicId), eq(objectTable.userId, user.id)),
    );
  const obj = rows[0];
  if (!obj) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let form: any;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file") as File | null;
  if (!file)
    return NextResponse.json({ error: "File is required" }, { status: 400 });

  // Server-side validation
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error: "Invalid file type. Only MP4, WebM, and MOV files are allowed.",
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB." },
      { status: 400 },
    );
  }

  const client = createR2Client();
  const arrayBuffer = await file.arrayBuffer();

  try {
    const key = buildVideoKey(obj.collectionId, obj.id);

    console.log("Uploading to R2:", {
      bucket: R2_BUCKET_NAME,
      key,
      fileSize: arrayBuffer.byteLength,
      contentType: file.type,
    });

    // Upload to R2
    const putResult = await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type,
      }),
    );

    console.log("R2 upload successful:", {
      etag: putResult.ETag,
      versionId: putResult.VersionId,
      key,
    });

    // Update database with video key
    await db
      .update(objectTable)
      .set({ videoR2Key: key })
      .where(eq(objectTable.id, obj.id));

    return NextResponse.json({ ok: true, key });
  } catch (e: any) {
    console.error("R2 PutObject failed", {
      message: e?.message,
      name: e?.name,
      code: e?.$metadata?.httpStatusCode,
      fullError: e,
    });
    return NextResponse.json(
      { error: "Upload failed", detail: e?.message || "unknown" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { user } = await validateRequest();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { publicId } = await params;
  const rows = await db
    .select()
    .from(objectTable)
    .where(
      and(eq(objectTable.publicId, publicId), eq(objectTable.userId, user.id)),
    );
  const obj = rows[0];
  if (!obj) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!obj.videoR2Key) return NextResponse.json({ ok: true }); // No video to delete

  const client = createR2Client();

  try {
    // Try to delete from R2 (may fail if file doesn't exist, which is OK)
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: obj.videoR2Key,
        }),
      );
    } catch (r2Error: any) {
      // Log but continue - we still want to clear the database reference
      console.warn("R2 delete failed (file may not exist):", r2Error?.message);
    }

    // Always clear video key from database
    await db
      .update(objectTable)
      .set({ videoR2Key: null })
      .where(eq(objectTable.id, obj.id));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Delete operation failed", {
      message: e?.message,
      name: e?.name,
    });
    return NextResponse.json(
      { error: "Delete failed", detail: e?.message || "unknown" },
      { status: 500 },
    );
  }
}
