import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { Note, Question } from "@/models";

/**
 * PATCH /api/notes/[id]/questions/[questionId]
 * Updates a flashcard question or answer.
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

    const { id, questionId } = await context.params;
    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(id) ||
      !questionId ||
      !mongoose.Types.ObjectId.isValid(questionId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid ID parameter." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { questionText, answerText, position } = body || {};

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const noteObjectId = new mongoose.Types.ObjectId(id);
    const questionObjectId = new mongoose.Types.ObjectId(questionId);

    // Verify ownership
    const note = await Note.findOne({ _id: noteObjectId, userId: userObjectId });
    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found." },
        { status: 404 }
      );
    }

    const question = await Question.findOne({
      _id: questionObjectId,
      noteId: noteObjectId,
    });

    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found." },
        { status: 404 }
      );
    }

    if (questionText !== undefined) {
      const trimmed = (questionText || "").trim();
      if (!trimmed) {
        return NextResponse.json(
          { success: false, message: "Question text cannot be empty." },
          { status: 400 }
        );
      }
      question.questionText = trimmed;
    }

    if (answerText !== undefined) {
      const trimmed = (answerText || "").trim();
      if (!trimmed) {
        return NextResponse.json(
          { success: false, message: "Answer text cannot be empty." },
          { status: 400 }
        );
      }
      question.answerText = trimmed;
    }

    if (typeof position === "number") {
      question.position = position;
    }

    await question.save();

    return NextResponse.json({
      success: true,
      message: "Question updated successfully.",
      question: {
        _id: question._id.toString(),
        noteId: question.noteId.toString(),
        questionText: question.questionText,
        answerText: question.answerText,
        position: question.position,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/notes/[id]/questions/[questionId]]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update question." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notes/[id]/questions/[questionId]
 * Deletes a flashcard question.
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

    const { id, questionId } = await context.params;
    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(id) ||
      !questionId ||
      !mongoose.Types.ObjectId.isValid(questionId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid ID parameter." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const noteObjectId = new mongoose.Types.ObjectId(id);
    const questionObjectId = new mongoose.Types.ObjectId(questionId);

    // Verify ownership
    const note = await Note.findOne({ _id: noteObjectId, userId: userObjectId });
    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found." },
        { status: 404 }
      );
    }

    const deleted = await Question.findOneAndDelete({
      _id: questionObjectId,
      noteId: noteObjectId,
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Question not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Flashcard deleted successfully.",
    });
  } catch (error) {
    console.error("[DELETE /api/notes/[id]/questions/[questionId]]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete question." },
      { status: 500 }
    );
  }
}

