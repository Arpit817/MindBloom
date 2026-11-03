import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { LearningPlan, LearningPlanItem, Subject, LearningResource } from "@/models";

/**
 * GET /api/plans
 * Retrieves all learning plans with progress stats.
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

    const plans = await LearningPlan.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    const planIds = plans.map((p) => p._id);

    // Aggregate progress stats per plan
    const itemStats = await LearningPlanItem.aggregate([
      { $match: { planId: { $in: planIds } } },
      {
        $group: {
          _id: "$planId",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$completed", true] }, 1, 0] },
          },
        },
      },
    ]);

    const statsMap = {};
    for (const stat of itemStats) {
      statsMap[stat._id.toString()] = {
        totalItems: stat.total,
        completedItems: stat.completed,
        progressPct: stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0,
      };
    }

    // Map subjects
    const subjects = await Subject.find({ userId: userObjectId }).lean();
    const subjectMap = {};
    for (const s of subjects) {
      subjectMap[s._id.toString()] = {
        _id: s._id.toString(),
        name: s.name,
        color: s.color,
      };
    }

    // Map resources
    const resources = await LearningResource.find({ userId: userObjectId }).lean();
    const resourceMap = {};
    for (const r of resources) {
      resourceMap[r._id.toString()] = {
        _id: r._id.toString(),
        title: r.title,
        url: r.url,
        platform: r.platform,
      };
    }

    const formattedPlans = plans.map((p) => {
      const stats = statsMap[p._id.toString()] || {
        totalItems: 0,
        completedItems: 0,
        progressPct: 0,
      };
      return {
        _id: p._id.toString(),
        title: p.title,
        description: p.description || "",
        planType: p.planType || "day-wise",
        startDate: p.startDate,
        subject: p.subjectId ? subjectMap[p.subjectId.toString()] || null : null,
        resource: p.resourceId ? resourceMap[p.resourceId.toString()] || null : null,
        stats,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return NextResponse.json({ success: true, plans: formattedPlans });
  } catch (error) {
    console.error("[GET /api/plans]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch learning plans." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/plans
 * Creates a new learning plan.
 * Body: { title, description?, planType?, subjectId?, resourceId?, startDate? }
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
    const { title, description, planType, subjectId, resourceId, startDate } = body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Plan title is required." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);

    const planData = {
      userId: userObjectId,
      title: title.trim(),
      description: (description || "").trim(),
      planType: ["day-wise", "step-wise", "custom"].includes(planType) ? planType : "day-wise",
      startDate: startDate ? new Date(startDate) : new Date(),
    };

    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      planData.subjectId = new mongoose.Types.ObjectId(subjectId);
    }
    if (resourceId && mongoose.Types.ObjectId.isValid(resourceId)) {
      planData.resourceId = new mongoose.Types.ObjectId(resourceId);
    }

    const plan = await LearningPlan.create(planData);

    return NextResponse.json(
      {
        success: true,
        message: "Learning plan created successfully.",
        plan: {
          _id: plan._id.toString(),
          title: plan.title,
          description: plan.description,
          planType: plan.planType,
          startDate: plan.startDate,
          subjectId: plan.subjectId ? plan.subjectId.toString() : null,
          resourceId: plan.resourceId ? plan.resourceId.toString() : null,
          stats: {
            totalItems: 0,
            completedItems: 0,
            progressPct: 0,
          },
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/plans]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create learning plan." },
      { status: 500 }
    );
  }
}

