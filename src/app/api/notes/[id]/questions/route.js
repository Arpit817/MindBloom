import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { Note, Question } from "@/models";

const MAX_QUESTIONS_PER_NOTE = 10;

/**
 * GET /api/notes/[id]/questions
 * Retrieves all flashcard questions for a note.
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

    // Verify ownership
    const note = await Note.findOne({ _id: noteObjectId, userId: userObjectId }).lean();
    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found." },
        { status: 404 }
      );
    }

    const questions = await Question.find({ noteId: noteObjectId })
      .sort({ position: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
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
    console.error("[GET /api/notes/[id]/questions]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch questions." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes/[id]/questions
 * Creates a new active recall flashcard question for this note.
 * Body: { questionText, answerText }
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
    const { questionText, answerText } = body || {};

    if (!questionText || typeof questionText !== "string" || !questionText.trim()) {
      return NextResponse.json(
        { success: false, message: "Question text is required." },
        { status: 400 }
      );
    }

    if (!answerText || typeof answerText !== "string" || !answerText.trim()) {
      return NextResponse.json(
        { success: false, message: "Answer text is required." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const noteObjectId = new mongoose.Types.ObjectId(id);

    // Verify ownership
    const note = await Note.findOne({ _id: noteObjectId, userId: userObjectId });
    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found." },
        { status: 404 }
      );
    }

    const currentCount = await Question.countDocuments({ noteId: noteObjectId });
    if (currentCount >= MAX_QUESTIONS_PER_NOTE) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum of ${MAX_QUESTIONS_PER_NOTE} flashcards allowed per note.`,
        },
        { status: 400 }
      );
    }

    const question = await Question.create({
      noteId: noteObjectId,
      questionText: questionText.trim(),
      answerText: answerText.trim(),
      position: currentCount + 1,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Flashcard question created.",
        question: {
          _id: question._id.toString(),
          noteId: question.noteId.toString(),
          questionText: question.questionText,
          answerText: question.answerText,
          position: question.position,
          createdAt: question.createdAt,
          updatedAt: question.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/notes/[id]/questions]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create question." },
      { status: 500 }
    );
  }
}

