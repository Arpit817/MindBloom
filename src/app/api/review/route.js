import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { Note, Question, Subject, ReviewSession, ActivityLog } from "@/models";
import { calculateNextReview, computeDynamicFreshness } from "@/lib/spacedRepetition";

/**
 * GET /api/review
 * Returns notes and flashcards due for review.
 * Query params:
 *   ?mode=due (default: nextReviewAt <= now)
 *   ?mode=all (all notes, for extra practice)
 *   ?subjectId=xxx (filter by subject)
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
    const mode = searchParams.get("mode") || "due";
    const subjectId = searchParams.get("subjectId");

    const now = new Date();

    const query = { userId: userObjectId };
    if (mode === "due") {
      query.nextReviewAt = { $lte: now };
    }
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      query.subjectId = new mongoose.Types.ObjectId(subjectId);
    }

    // Fetch notes matching criteria
    const notes = await Note.find(query)
      .sort({ nextReviewAt: 1, updatedAt: -1 })
      .lean();

    // Fetch subjects for mapping colors and names
    const subjects = await Subject.find({ userId: userObjectId }).lean();
    const subjectMap = {};
    for (const s of subjects) {
      subjectMap[s._id.toString()] = {
        _id: s._id.toString(),
        name: s.name,
        color: s.color || "#0e87e8",
      };
    }

    // Fetch questions for all retrieved notes
    const noteIds = notes.map((n) => n._id);
    const questions = await Question.find({ noteId: { $in: noteIds } })
      .sort({ position: 1 })
      .lean();

    const questionsByNote = {};
    for (const q of questions) {
      const nId = q.noteId.toString();
      if (!questionsByNote[nId]) questionsByNote[nId] = [];
      questionsByNote[nId].push({
        _id: q._id.toString(),
        noteId: nId,
        questionText: q.questionText,
        answerText: q.answerText,
        position: q.position,
      });
    }

    // Calculate today's stats
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalDue, completedToday, masteredCount] = await Promise.all([
      Note.countDocuments({ userId: userObjectId, nextReviewAt: { $lte: now } }),
      ReviewSession.countDocuments({
        userId: userObjectId,
        reviewedAt: { $gte: startOfToday },
      }),
      Note.countDocuments({ userId: userObjectId, reviewStage: { $gte: 10 } }),
    ]);

    const formattedNotes = notes.map((n) => {
      const dynamicFreshness = computeDynamicFreshness(n.nextReviewAt, n.lastReviewedAt || n.createdAt);
      return {
        _id: n._id.toString(),
        title: n.title,
        content: n.content || "",
        subject: subjectMap[n.subjectId.toString()] || null,
        reviewStage: n.reviewStage,
        freshnessScore: dynamicFreshness,
        nextReviewAt: n.nextReviewAt,
        lastReviewedAt: n.lastReviewedAt,
        questions: questionsByNote[n._id.toString()] || [],
      };
    });

    return NextResponse.json({
      success: true,
      notes: formattedNotes,
      stats: {
        totalDue,
        completedToday,
        masteredCount,
      },
    });
  } catch (error) {
    console.error("[GET /api/review]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch review items." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/review
 * Records a completed review session for a note.
 * Body: { noteId, result } where result is "forgot" | "partial" | "remembered"
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
    const { noteId, result } = body || {};

    if (!noteId || !mongoose.Types.ObjectId.isValid(noteId)) {
      return NextResponse.json(
        { success: false, message: "A valid noteId is required." },
        { status: 400 }
      );
    }

    const validResults = ["forgot", "partial", "remembered"];
    if (!result || !validResults.includes(result)) {
      return NextResponse.json(
        {
          success: false,
          message: `Result must be one of: ${validResults.join(", ")}`,
        },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const noteObjectId = new mongoose.Types.ObjectId(noteId);

    const note = await Note.findOne({ _id: noteObjectId, userId: userObjectId });
    if (!note) {
      return NextResponse.json(
        { success: false, message: "Note not found." },
        { status: 404 }
      );
    }

    const previousStage = note.reviewStage || 0;
    const previousNextReviewAt = note.nextReviewAt;

    // Run the Spaced Repetition calculation
    const { newStage, intervalDays, nextReviewAt, freshnessScore } = calculateNextReview(
      previousStage,
      result
    );

    const now = new Date();

    // Update note
    note.reviewStage = newStage;
    note.freshnessScore = freshnessScore;
    note.nextReviewAt = nextReviewAt;
    note.lastReviewedAt = now;
    await note.save();

    // Create ReviewSession log
    await ReviewSession.create({
      userId: userObjectId,
      noteId: noteObjectId,
      result,
      previousStage,
      newStage,
      previousNextReviewAt,
      newNextReviewAt: nextReviewAt,
      reviewedAt: now,
    });

    // Create ActivityLog
    const resultLabels = {
      forgot: "Forgot (Reset to Stage 0)",
      partial: "Partially recalled (Stage maintained)",
      remembered: `Remembered (Advanced to Stage ${newStage})`,
    };

    await ActivityLog.create({
      userId: userObjectId,
      activityType: "review_completed",
      noteId: noteObjectId,
      subjectId: note.subjectId,
      description: `Reviewed note "${note.title}": ${resultLabels[result]}. Next review in ${intervalDays} day(s).`,
    });

    return NextResponse.json({
      success: true,
      message: "Review recorded successfully.",
      review: {
        noteId: note._id.toString(),
        previousStage,
        newStage,
        intervalDays,
        nextReviewAt,
        freshnessScore,
      },
    });
  } catch (error) {
    console.error("[POST /api/review]", error);
    return NextResponse.json(
      { success: false, message: "Failed to record review." },
      { status: 500 }
    );
  }
}

