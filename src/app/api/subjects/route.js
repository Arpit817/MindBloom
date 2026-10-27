import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { Subject, Note } from "@/models";

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * GET /api/subjects
 * Retrieves all subjects belonging to the authenticated user with note counts.
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

    // Fetch subjects sorted by creation time descending
    const subjects = await Subject.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate note counts per subject for this user
    const noteCounts = await Note.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: "$subjectId", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    for (const item of noteCounts) {
      if (item._id) {
        countMap[item._id.toString()] = item.count;
      }
    }

    const formattedSubjects = subjects.map((sub) => ({
      _id: sub._id.toString(),
      name: sub.name,
      color: sub.color || "#0e87e8",
      noteCount: countMap[sub._id.toString()] || 0,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      subjects: formattedSubjects,
    });
  } catch (error) {
    console.error("[GET /api/subjects]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subjects." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subjects
 * Creates a new subject for the authenticated user.
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
    const rawName = body?.name;
    const rawColor = body?.color;

    if (!rawName || typeof rawName !== "string" || !rawName.trim()) {
      return NextResponse.json(
        { success: false, message: "Subject name is required." },
        { status: 400 }
      );
    }

    const trimmedName = rawName.trim();
    if (trimmedName.length > 80) {
      return NextResponse.json(
        { success: false, message: "Subject name cannot exceed 80 characters." },
        { status: 400 }
      );
    }

    let color = "#0e87e8";
    if (rawColor && typeof rawColor === "string" && HEX_COLOR_REGEX.test(rawColor.trim())) {
      color = rawColor.trim();
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);

    // Check for duplicate name (case-insensitive) for this user
    const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existingSubject = await Subject.findOne({
      userId: userObjectId,
      name: { $regex: new RegExp(`^${escapedName}$`, "i") },
    });

    if (existingSubject) {
      return NextResponse.json(
        { success: false, message: "A subject with this name already exists." },
        { status: 409 }
      );
    }

    const subject = await Subject.create({
      userId: userObjectId,
      name: trimmedName,
      color,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Subject created successfully.",
        subject: {
          _id: subject._id.toString(),
          name: subject.name,
          color: subject.color,
          noteCount: 0,
          createdAt: subject.createdAt,
          updatedAt: subject.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/subjects]", error);
    // Handle MongoDB unique constraint error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "A subject with this name already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to create subject." },
      { status: 500 }
    );
  }
}
