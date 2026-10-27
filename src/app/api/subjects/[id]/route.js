import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { Subject, Note, LearningResource } from "@/models";

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * PATCH /api/subjects/[id]
 * Updates subject name and/or color.
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
        { success: false, message: "Invalid subject ID." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, color } = body || {};

    if (name === undefined && color === undefined) {
      return NextResponse.json(
        { success: false, message: "No fields provided to update." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const subjectObjectId = new mongoose.Types.ObjectId(id);

    const subject = await Subject.findOne({
      _id: subjectObjectId,
      userId: userObjectId,
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, message: "Subject not found." },
        { status: 404 }
      );
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { success: false, message: "Subject name cannot be empty." },
          { status: 400 }
        );
      }

      const trimmedName = name.trim();
      if (trimmedName.length > 80) {
        return NextResponse.json(
          { success: false, message: "Subject name cannot exceed 80 characters." },
          { status: 400 }
        );
      }

      // Check if another subject by this user has this name
      const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const duplicate = await Subject.findOne({
        userId: userObjectId,
        _id: { $ne: subjectObjectId },
        name: { $regex: new RegExp(`^${escapedName}$`, "i") },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "A subject with this name already exists." },
          { status: 409 }
        );
      }

      subject.name = trimmedName;
    }

    if (color !== undefined) {
      if (typeof color === "string" && HEX_COLOR_REGEX.test(color.trim())) {
        subject.color = color.trim();
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid color format. Please use a valid hex code." },
          { status: 400 }
        );
      }
    }

    await subject.save();

    const noteCount = await Note.countDocuments({
      userId: userObjectId,
      subjectId: subjectObjectId,
    });

    return NextResponse.json({
      success: true,
      message: "Subject updated successfully.",
      subject: {
        _id: subject._id.toString(),
        name: subject.name,
        color: subject.color,
        noteCount,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/subjects/[id]]", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "A subject with this name already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to update subject." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subjects/[id]
 * Deletes a subject and its associated notes.
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
        { success: false, message: "Invalid subject ID." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const subjectObjectId = new mongoose.Types.ObjectId(id);

    const subject = await Subject.findOne({
      _id: subjectObjectId,
      userId: userObjectId,
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, message: "Subject not found." },
        { status: 404 }
      );
    }

    // Cascade delete notes and learning resources associated with this subject
    await Note.deleteMany({
      userId: userObjectId,
      subjectId: subjectObjectId,
    });

    await LearningResource.deleteMany({
      userId: userObjectId,
      subjectId: subjectObjectId,
    });

    // Delete the subject itself
    await Subject.findByIdAndDelete(subjectObjectId);

    return NextResponse.json({
      success: true,
      message: `Subject "${subject.name}" and all its notes were deleted.`,
    });
  } catch (error) {
    console.error("[DELETE /api/subjects/[id]]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subject." },
      { status: 500 }
    );
  }
}
