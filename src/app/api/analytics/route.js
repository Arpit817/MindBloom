import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { Note, ReviewSession, ActivityLog } from "@/models";
import { computeDynamicFreshness } from "@/lib/spacedRepetition";

/**
 * GET /api/analytics
 * Computes spaced repetition progress, stage distributions, memory health, streak, and 60-day heatmap.
 */
export async function GET() {
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

    // Fetch all user notes
    const notes = await Note.find({ userId: userObjectId }).lean();
    const totalNotes = notes.length;

    // 1. Stage Distribution (0 to 10)
    const stageDistribution = new Array(11).fill(0);
    let totalFreshness = 0;

    for (const note of notes) {
      const stage = Math.max(0, Math.min(10, note.reviewStage || 0));
      stageDistribution[stage] += 1;
      const dynamicFreshness = computeDynamicFreshness(note.nextReviewAt, note.lastReviewedAt || note.createdAt);
      totalFreshness += dynamicFreshness;
    }

    const averageFreshness = totalNotes > 0 ? Math.round(totalFreshness / totalNotes) : 100;

    const masteryBreakdown = {
      learning: stageDistribution.slice(0, 4).reduce((a, b) => a + b, 0),    // 0-3
      retaining: stageDistribution.slice(4, 8).reduce((a, b) => a + b, 0),   // 4-7
      mastered: stageDistribution.slice(8, 11).reduce((a, b) => a + b, 0),   // 8-10
    };

    // 2. Review Sessions Analytics
    const reviewSessions = await ReviewSession.find({ userId: userObjectId })
      .sort({ reviewedAt: -1 })
      .lean();

    const totalReviews = reviewSessions.length;
    let rememberedCount = 0;
    let partialCount = 0;
    let forgotCount = 0;

    for (const r of reviewSessions) {
      if (r.result === "remembered") rememberedCount++;
      else if (r.result === "partial") partialCount++;
      else if (r.result === "forgot") forgotCount++;
    }

    const accuracyRate = totalReviews > 0 ? Math.round((rememberedCount / totalReviews) * 100) : 100;

    // 3. 60-Day Activity & Heatmap
    const days = 60;
    const now = new Date();
    const activityMap = {};

    // Initialize last 60 days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      activityMap[dateKey] = 0;
    }

    // Populate from review sessions
    for (const r of reviewSessions) {
      if (r.reviewedAt) {
        const dKey = new Date(r.reviewedAt).toISOString().split("T")[0];
        if (activityMap[dKey] !== undefined) {
          activityMap[dKey] += 1;
        }
      }
    }

    // Populate from activity log as well
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - days);

    const logs = await ActivityLog.find({
      userId: userObjectId,
      createdAt: { $gte: sixtyDaysAgo },
    }).lean();

    for (const log of logs) {
      if (log.createdAt) {
        const dKey = new Date(log.createdAt).toISOString().split("T")[0];
        if (activityMap[dKey] !== undefined) {
          activityMap[dKey] += 1;
        }
      }
    }

    const heatmap = Object.keys(activityMap).map((date) => {
      const count = activityMap[date];
      let level = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 5) level = 2;
      else if (count > 5 && count <= 9) level = 3;
      else if (count >= 10) level = 4;

      return { date, count, level };
    });

    // 4. Streak Calculation
    let currentStreak = 0;
    const sortedDates = Object.keys(activityMap).sort().reverse();
    const todayKey = now.toISOString().split("T")[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split("T")[0];

    // Check if user was active today or yesterday to continue streak
    let activeDatePointer = activityMap[todayKey] > 0 ? todayKey : activityMap[yesterdayKey] > 0 ? yesterdayKey : null;

    if (activeDatePointer) {
      const pDate = new Date(activeDatePointer);
      while (true) {
        const checkKey = pDate.toISOString().split("T")[0];
        if (activityMap[checkKey] && activityMap[checkKey] > 0) {
          currentStreak++;
          pDate.setDate(pDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      analytics: {
        totalNotes,
        totalReviews,
        averageFreshness,
        accuracyRate,
        currentStreak,
        stageDistribution,
        masteryBreakdown,
        accuracy: {
          remembered: rememberedCount,
          partial: partialCount,
          forgot: forgotCount,
        },
        heatmap,
      },
    });
  } catch (error) {
    console.error("[GET /api/analytics]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics." },
      { status: 500 }
    );
  }
}

