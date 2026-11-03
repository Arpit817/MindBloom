import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { Note, Subject } from "@/models";

/**
 * GET /api/notes
 * Returns notes for the authenticated user.
 * Optional query param: ?subjectId=<ObjectId>
 */
export async function GET(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);

    const { searchParams } = new URL(req.url);
    const subjectIdParam = searchParams.get("subjectId");

    const query = { userId: userObjectId };
    if (subjectIdParam && mongoose.Types.ObjectId.isValid(subjectIdParam)) {
      query.subjectId = new mongoose.Types.ObjectId(subjectIdParam);
    }

    const notes = await Note.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    const formattedNotes = notes.map((n) => ({
      _id: n._id.toString(),
      subjectId: n.subjectId.toString(),
      title: n.title,
      content: n.content || "",
      reviewStage: n.reviewStage,
      freshnessScore: n.freshnessScore,
      nextReviewAt: n.nextReviewAt,
      lastReviewedAt: n.lastReviewedAt,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));

    return NextResponse.json({ success: true, notes: formattedNotes });
  } catch (error) {
    console.error("[GET /api/notes]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notes." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes
 * Creates a new note under a subject for the authenticated user.
 * Body: { subjectId, title, content? }
 */
export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { subjectId, title, content } = body || {};

    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return NextResponse.json(
        { success: false, message: "A valid subjectId is required." },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Note title is required." },
        { status: 400 }
      );
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 150) {
      return NextResponse.json(
        { success: false, message: "Title cannot exceed 150 characters." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const subjectObjectId = new mongoose.Types.ObjectId(subjectId);

    // Verify subject belongs to user
    const subject = await Subject.findOne({
      _id: subjectObjectId,
      userId: userObjectId,
    }).lean();

    if (!subject) {
      return NextResponse.json(
        { success: false, message: "Subject not found." },
        { status: 404 }
      );
    }

    const note = await Note.create({
      userId: userObjectId,
      subjectId: subjectObjectId,
      title: trimmedTitle,
      content: typeof content === "string" ? content : "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Note created successfully.",
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/notes]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create note." },
      { status: 500 }
    );
  }
}
