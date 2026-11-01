import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { Note } from "@/models";
import { getUploadPresignedUrl } from "@/lib/s3/s3Client";
import { randomUUID } from "crypto";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * POST /api/notes/[id]/images/presign
 * Returns a presigned PUT URL for uploading an image to S3 from the browser.
 * Body: { fileName, mimeType, fileSize }
 */
export async function POST(req, context) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid note ID." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { fileName, mimeType, fileSize } = body || {};

    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json(
        { success: false, message: "fileName is required." },
        { status: 400 }
      );
    }

    if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "File size exceeds the 10MB limit." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const noteObjectId = new mongoose.Types.ObjectId(id);

    // Verify note ownership
    const note = await Note.findOne({
      _id: noteObjectId,
      userId: userObjectId,
    }).lean();

    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found." },
        { status: 404 }
      );
    }

    // Build a unique, organized S3 key
    const ext = fileName.split(".").pop() || "jpg";
    const uniqueId = randomUUID();
    const s3Key = `users/${session.userId}/notes/${id}/images/${uniqueId}.${ext}`;

    const presignedUrl = await getUploadPresignedUrl(s3Key, mimeType, 300); // 5 min expiry

    return NextResponse.json({
      success: true,
      presignedUrl,
      s3Key,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("[POST /api/notes/[id]/images/presign]", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate upload URL." },
      { status: 500 }
    );
  }
}
