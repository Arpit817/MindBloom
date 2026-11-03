import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { Note, NoteImage } from "@/models";
import { deleteS3Object } from "@/lib/s3/s3Client";

/**
 * GET /api/notes/[id]/images
 * Returns all images for a note.
 */
export async function GET(_req, context) {
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

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const noteObjectId = new mongoose.Types.ObjectId(id);

    // Verify note ownership
    const note = await Note.findOne({ _id: noteObjectId, userId: userObjectId }).lean();
    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found." },
        { status: 404 }
      );
    }

    const images = await NoteImage.find({ noteId: noteObjectId, userId: userObjectId })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      images: images.map((img) => ({
        _id: img._id.toString(),
        s3Key: img.s3Key,
        imageUrl: img.imageUrl,
        fileName: img.fileName,
        fileSize: img.fileSize,
        mimeType: img.mimeType,
        displayOrder: img.displayOrder,
        createdAt: img.createdAt,
      })),
    });
  } catch (error) {
    console.error("[GET /api/notes/[id]/images]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch images." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes/[id]/images
 * Registers an uploaded S3 image in the database.
 * Call this AFTER the browser successfully PUTs the file to the S3 presigned URL.
 * Body: { s3Key, fileName, fileSize, mimeType }
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
    const { s3Key, fileName, fileSize, mimeType } = body || {};

    if (!s3Key || typeof s3Key !== "string") {
      return NextResponse.json(
        { success: false, message: "s3Key is required." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const noteObjectId = new mongoose.Types.ObjectId(id);

    // Verify note ownership
    const note = await Note.findOne({ _id: noteObjectId, userId: userObjectId }).lean();
    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found." },
        { status: 404 }
      );
    }

    // Build the public or permanent URL
    // Using the S3 key itself as reference; presigned GET URLs generated on demand
    const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${s3Key}`;

    // Determine display order (append to end)
    const existingCount = await NoteImage.countDocuments({ noteId: noteObjectId });

    const noteImage = await NoteImage.create({
      noteId: noteObjectId,
      userId: userObjectId,
      s3Key,
      imageUrl,
      fileName: fileName || null,
      fileSize: fileSize || null,
      mimeType: mimeType || null,
      displayOrder: existingCount,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Image registered successfully.",
        image: {
          _id: noteImage._id.toString(),
          s3Key: noteImage.s3Key,
          imageUrl: noteImage.imageUrl,
          fileName: noteImage.fileName,
          fileSize: noteImage.fileSize,
          mimeType: noteImage.mimeType,
          displayOrder: noteImage.displayOrder,
          createdAt: noteImage.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/notes/[id]/images]", error);
    return NextResponse.json(
      { success: false, message: "Failed to register image." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notes/[id]/images
 * Deletes all images for a note (used internally).
 * Body: { imageId } to delete a specific image.
 */
export async function DELETE(req, context) {
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
    const { imageId } = body || {};

    if (!imageId || !mongoose.Types.ObjectId.isValid(imageId)) {
      return NextResponse.json(
        { success: false, message: "A valid imageId is required." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const noteObjectId = new mongoose.Types.ObjectId(id);
    const imageObjectId = new mongoose.Types.ObjectId(imageId);

    const image = await NoteImage.findOne({
      _id: imageObjectId,
      noteId: noteObjectId,
      userId: userObjectId,
    });

    if (!image) {
      return NextResponse.json(
        { success: false, message: "Image not found." },
        { status: 404 }
      );
    }

    // Delete from S3
    try {
      await deleteS3Object(image.s3Key);
    } catch (s3Err) {
      console.error("[DELETE IMAGE] S3 delete failed:", s3Err);
      // Continue deleting from DB even if S3 fails
    }

    await NoteImage.findByIdAndDelete(imageObjectId);

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully.",
    });
  } catch (error) {
    console.error("[DELETE /api/notes/[id]/images]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete image." },
      { status: 500 }
    );
  }
}
