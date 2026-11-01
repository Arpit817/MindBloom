import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { Note, NoteImage, Question } from "@/models";
import { deleteS3Object } from "@/lib/s3/s3Client";

/**
 * GET /api/notes/[id]
 * Returns a single note with its images.
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

    const [images, questions] = await Promise.all([
      NoteImage.find({ noteId: noteObjectId, userId: userObjectId })
        .sort({ displayOrder: 1, createdAt: 1 })
        .lean(),
      Question.find({ noteId: noteObjectId })
        .sort({ position: 1, createdAt: 1 })
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      note: {
        _id: note._id.toString(),
        subjectId: note.subjectId.toString(),
        title: note.title,
        content: note.content || "",
        reviewStage: note.reviewStage,
        freshnessScore: note.freshnessScore,
        nextReviewAt: note.nextReviewAt,
        lastReviewedAt: note.lastReviewedAt,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
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
      questions: questions.map((q) => ({
        _id: q._id.toString(),
        noteId: q.noteId.toString(),
        questionText: q.questionText,
        answerText: q.answerText,
        position: q.position,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      })),
    });
  } catch (error) {
    console.error("[GET /api/notes/[id]]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch note." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notes/[id]
 * Updates a note's title and/or content.
 * Body: { title?, content? }
 */
export async function PATCH(req, context) {
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
    const { title, content } = body || {};

    if (title === undefined && content === undefined) {
      return NextResponse.json(
        { success: false, message: "No fields provided to update." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const noteObjectId = new mongoose.Types.ObjectId(id);

    const note = await Note.findOne({
      _id: noteObjectId,
      userId: userObjectId,
    });

    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found." },
        { status: 404 }
      );
    }

    if (title !== undefined) {
      const trimmedTitle = (title || "").trim();
      if (!trimmedTitle) {
        return NextResponse.json(
          { success: false, message: "Note title cannot be empty." },
          { status: 400 }
        );
      }
      if (trimmedTitle.length > 150) {
        return NextResponse.json(
          { success: false, message: "Title cannot exceed 150 characters." },
          { status: 400 }
        );
      }
      note.title = trimmedTitle;
    }

    if (content !== undefined) {
      note.content = typeof content === "string" ? content : "";
    }

    await note.save();

    return NextResponse.json({
      success: true,
      message: "Note updated successfully.",
      note: {
        _id: note._id.toString(),
        subjectId: note.subjectId.toString(),
        title: note.title,
        content: note.content,
        reviewStage: note.reviewStage,
        freshnessScore: note.freshnessScore,
        nextReviewAt: note.nextReviewAt,
        lastReviewedAt: note.lastReviewedAt,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/notes/[id]]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update note." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notes/[id]
 * Deletes a note and its associated images from S3 and DB.
 */
export async function DELETE(_req, context) {
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

    const note = await Note.findOne({
      _id: noteObjectId,
      userId: userObjectId,
    });

    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found." },
        { status: 404 }
      );
    }

    // Delete all images from S3
    const images = await NoteImage.find({ noteId: noteObjectId, userId: userObjectId }).lean();
    await Promise.allSettled(
      images.map((img) => deleteS3Object(img.s3Key))
    );

    // Delete image records and questions from DB
    await Promise.all([
      NoteImage.deleteMany({ noteId: noteObjectId }),
      Question.deleteMany({ noteId: noteObjectId }),
    ]);

    // Delete the note
    await Note.findByIdAndDelete(noteObjectId);

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error("[DELETE /api/notes/[id]]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete note." },
      { status: 500 }
    );
  }
}
