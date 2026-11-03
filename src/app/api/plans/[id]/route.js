import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { LearningPlan, LearningPlanItem, Subject, LearningResource } from "@/models";

/**
 * GET /api/plans/[id]
 * Retrieves a single learning plan with all its checklist items.
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
        { success: false, message: "Invalid plan ID." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const planObjectId = new mongoose.Types.ObjectId(id);

    const plan = await LearningPlan.findOne({
      _id: planObjectId,
      userId: userObjectId,
    }).lean();

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Learning plan not found." },
        { status: 404 }
      );
    }

    // Fetch items
    const items = await LearningPlanItem.find({ planId: planObjectId })
      .sort({ dayNumber: 1, stepNumber: 1, createdAt: 1 })
      .lean();

    // Fetch subject
    let subject = null;
    if (plan.subjectId) {
      subject = await Subject.findOne({ _id: plan.subjectId }).lean();
    }

    // Fetch resource
    let resource = null;
    if (plan.resourceId) {
      resource = await LearningResource.findOne({ _id: plan.resourceId }).lean();
    }

    const completedCount = items.filter((i) => i.completed).length;
    const totalCount = items.length;

    return NextResponse.json({
      success: true,
      plan: {
        _id: plan._id.toString(),
        title: plan.title,
        description: plan.description || "",
        planType: plan.planType || "day-wise",
        startDate: plan.startDate,
        subject: subject
          ? {
              _id: subject._id.toString(),
              name: subject.name,
              color: subject.color,
            }
          : null,
        resource: resource
          ? {
              _id: resource._id.toString(),
              title: resource.title,
              url: resource.url,
              platform: resource.platform,
              resourceType: resource.resourceType,
            }
          : null,
        stats: {
          totalItems: totalCount,
          completedItems: completedCount,
          progressPct: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        },
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      },
      items: items.map((item) => ({
        _id: item._id.toString(),
        planId: item.planId.toString(),
        title: item.title,
        description: item.description || "",
        stepNumber: item.stepNumber,
        dayNumber: item.dayNumber,
        scheduledDate: item.scheduledDate,
        completed: item.completed,
        completedAt: item.completedAt,
        resourceId: item.resourceId ? item.resourceId.toString() : null,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error("[GET /api/plans/[id]]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch learning plan." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/plans/[id]
 * Updates a plan's details.
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
        { success: false, message: "Invalid plan ID." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, description, planType, subjectId, resourceId, startDate } = body || {};

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const planObjectId = new mongoose.Types.ObjectId(id);

    const plan = await LearningPlan.findOne({
      _id: planObjectId,
      userId: userObjectId,
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Learning plan not found." },
        { status: 404 }
      );
    }

    if (title !== undefined) {
      const trimmed = (title || "").trim();
      if (!trimmed) {
        return NextResponse.json(
          { success: false, message: "Title cannot be empty." },
          { status: 400 }
        );
      }
      plan.title = trimmed;
    }

    if (description !== undefined) {
      plan.description = (description || "").trim();
    }

    if (planType !== undefined && ["day-wise", "step-wise", "custom"].includes(planType)) {
      plan.planType = planType;
    }

    if (subjectId !== undefined) {
      plan.subjectId = subjectId && mongoose.Types.ObjectId.isValid(subjectId)
        ? new mongoose.Types.ObjectId(subjectId)
        : null;
    }

    if (resourceId !== undefined) {
      plan.resourceId = resourceId && mongoose.Types.ObjectId.isValid(resourceId)
        ? new mongoose.Types.ObjectId(resourceId)
        : null;
    }

    if (startDate !== undefined) {
      plan.startDate = startDate ? new Date(startDate) : null;
    }

    await plan.save();

    return NextResponse.json({
      success: true,
      message: "Learning plan updated successfully.",
      plan: {
        _id: plan._id.toString(),
        title: plan.title,
        description: plan.description,
        planType: plan.planType,
        startDate: plan.startDate,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/plans/[id]]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update learning plan." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/plans/[id]
 * Deletes a learning plan and cascade-deletes all its items.
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
        { success: false, message: "Invalid plan ID." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const planObjectId = new mongoose.Types.ObjectId(id);

    const plan = await LearningPlan.findOneAndDelete({
      _id: planObjectId,
      userId: userObjectId,
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Learning plan not found." },
        { status: 404 }
      );
    }

    // Cascade delete all items in this plan
    await LearningPlanItem.deleteMany({ planId: planObjectId });

    return NextResponse.json({
      success: true,
      message: "Learning plan and all items deleted successfully.",
    });
  } catch (error) {
    console.error("[DELETE /api/plans/[id]]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete learning plan." },
      { status: 500 }
    );
  }
}

