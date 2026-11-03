import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { LearningPlan, LearningPlanItem } from "@/models";

/**
 * POST /api/plans/[id]/items
 * Adds a new item/day to a learning plan.
 * Body: { title, description?, dayNumber?, stepNumber?, scheduledDate?, resourceId? }
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
        { success: false, message: "Invalid plan ID." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, description, dayNumber, stepNumber, scheduledDate, resourceId } = body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Item title is required." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const planObjectId = new mongoose.Types.ObjectId(id);

    // Verify ownership
    const plan = await LearningPlan.findOne({ _id: planObjectId, userId: userObjectId });
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Learning plan not found." },
        { status: 404 }
      );
    }

    // Determine default day/step number if not provided
    const existingCount = await LearningPlanItem.countDocuments({ planId: planObjectId });
    const assignedDay = typeof dayNumber === "number" ? dayNumber : existingCount + 1;
    const assignedStep = typeof stepNumber === "number" ? stepNumber : existingCount + 1;

    const item = await LearningPlanItem.create({
      planId: planObjectId,
      title: title.trim(),
      description: (description || "").trim(),
      dayNumber: assignedDay,
      stepNumber: assignedStep,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      resourceId: resourceId && mongoose.Types.ObjectId.isValid(resourceId)
        ? new mongoose.Types.ObjectId(resourceId)
        : null,
      completed: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Plan item added successfully.",
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
          createdAt: item.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/plans/[id]/items]", error);
    return NextResponse.json(
      { success: false, message: "Failed to add plan item." },
      { status: 500 }
    );
  }
}

