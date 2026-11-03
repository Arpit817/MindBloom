import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { ActivityLog, Subject, Note, LearningPlan } from "@/models";

/**
 * GET /api/activity
 * Retrieves the user's chronological study activity feed.
 * Query: ?type=xxx & ?limit=50
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
    const typeFilter = searchParams.get("type");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const query = { userId: userObjectId };
    if (typeFilter && typeFilter !== "all") {
      query.activityType = typeFilter;
    }

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Map subjects
    const subjects = await Subject.find({ userId: userObjectId }).lean();
    const subjectMap = {};
    for (const s of subjects) {
      subjectMap[s._id.toString()] = { name: s.name, color: s.color };
    }

    // Map notes
    const notes = await Note.find({ userId: userObjectId }).lean();
    const noteMap = {};
    for (const n of notes) {
      noteMap[n._id.toString()] = n.title;
    }

    // Map plans
    const plans = await LearningPlan.find({ userId: userObjectId }).lean();
    const planMap = {};
    for (const p of plans) {
      planMap[p._id.toString()] = p.title;
    }

    const formattedLogs = logs.map((log) => ({
      _id: log._id.toString(),
      activityType: log.activityType,
      description: log.description,
      subject: log.subjectId ? subjectMap[log.subjectId.toString()] || null : null,
      noteTitle: log.noteId ? noteMap[log.noteId.toString()] || null : null,
      planTitle: log.planId ? planMap[log.planId.toString()] || null : null,
      createdAt: log.createdAt,
    }));

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
      totalCount: logs.length,
    });
  } catch (error) {
    console.error("[GET /api/activity]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch activity logs." },
      { status: 500 }
    );
  }
}

