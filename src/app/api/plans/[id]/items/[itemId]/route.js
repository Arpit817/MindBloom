import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { LearningPlan, LearningPlanItem, ActivityLog } from "@/models";

/**
 * PATCH /api/plans/[id]/items/[itemId]
 * Updates item details or toggles completion.
 * Body: { completed?, title?, description?, dayNumber?, stepNumber?, scheduledDate? }
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

    const { id, itemId } = await context.params;
    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(id) ||
      !itemId ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid ID parameters." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { completed, title, description, dayNumber, stepNumber, scheduledDate } = body || {};

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const planObjectId = new mongoose.Types.ObjectId(id);
    const itemObjectId = new mongoose.Types.ObjectId(itemId);

    // Verify ownership of the plan
    const plan = await LearningPlan.findOne({ _id: planObjectId, userId: userObjectId });
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Learning plan not found." },
        { status: 404 }
      );
    }

    const item = await LearningPlanItem.findOne({ _id: itemObjectId, planId: planObjectId });
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Plan item not found." },
        { status: 404 }
      );
    }

    if (completed !== undefined) {
      const isNowCompleted = Boolean(completed);
      item.completed = isNowCompleted;
      item.completedAt = isNowCompleted ? new Date() : null;

      // Log activity if completed
      if (isNowCompleted) {
        await ActivityLog.create({
          userId: userObjectId,
          activityType: "plan_item_completed",
          planId: planObjectId,
          description: `Completed Day ${item.dayNumber || item.stepNumber || 1}: "${item.title}" in plan "${plan.title}".`,
        });
      }
    }

    if (title !== undefined) {
      const trimmed = (title || "").trim();
      if (!trimmed) {
        return NextResponse.json(
          { success: false, message: "Title cannot be empty." },
          { status: 400 }
        );
      }
      item.title = trimmed;
    }

    if (description !== undefined) {
      item.description = (description || "").trim();
    }

    if (typeof dayNumber === "number") item.dayNumber = dayNumber;
    if (typeof stepNumber === "number") item.stepNumber = stepNumber;
    if (scheduledDate !== undefined) {
      item.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    }

    await item.save();

    return NextResponse.json({
      success: true,
      message: "Plan item updated.",
      item: {
        _id: item._id.toString(),
        planId: item.planId.toString(),
        title: item.title,
        description: item.description,
        dayNumber: item.dayNumber,
        stepNumber: item.stepNumber,
        scheduledDate: item.scheduledDate,
        completed: item.completed,
        completedAt: item.completedAt,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/plans/[id]/items/[itemId]]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update plan item." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/plans/[id]/items/[itemId]
 * Deletes a single item from the plan.
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

    const { id, itemId } = await context.params;
    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(id) ||
      !itemId ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid ID parameters." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const planObjectId = new mongoose.Types.ObjectId(id);
    const itemObjectId = new mongoose.Types.ObjectId(itemId);

    // Verify ownership
    const plan = await LearningPlan.findOne({ _id: planObjectId, userId: userObjectId });
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Learning plan not found." },
        { status: 404 }
      );
    }

    const deleted = await LearningPlanItem.findOneAndDelete({
      _id: itemObjectId,
      planId: planObjectId,
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Plan item deleted successfully.",
    });
  } catch (error) {
    console.error("[DELETE /api/plans/[id]/items/[itemId]]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete item." },
      { status: 500 }
    );
  }
}

