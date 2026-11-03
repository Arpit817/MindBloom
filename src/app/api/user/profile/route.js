import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { User, Note, Subject, LearningPlan, NoteImage } from "@/models";
import { comparePassword, hashPassword } from "@/lib/auth/password";

const AWS_S3_FREE_TIER_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB in bytes

/**
 * GET /api/user/profile
 * Retrieves user account info and storage/cloud usage metrics.
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

    const user = await User.findById(userObjectId).lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    // Aggregate storage usage
    const [notesCount, subjectsCount, plansCount, imageStats] = await Promise.all([
      Note.countDocuments({ userId: userObjectId }),
      Subject.countDocuments({ userId: userObjectId }),
      LearningPlan.countDocuments({ userId: userObjectId }),
      NoteImage.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: null,
            totalBytes: { $sum: "$fileSize" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalBytesUsed = imageStats[0]?.totalBytes || 0;
    const totalImages = imageStats[0]?.count || 0;
    const freeTierUsedPct = ((totalBytesUsed / AWS_S3_FREE_TIER_BYTES) * 100).toFixed(4);

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      storage: {
        totalImages,
        totalBytesUsed,
        freeTierLimitBytes: AWS_S3_FREE_TIER_BYTES,
        freeTierUsedPct: parseFloat(freeTierUsedPct),
        notesCount,
        subjectsCount,
        plansCount,
      },
    });
  } catch (error) {
    console.error("[GET /api/user/profile]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Updates account details (name) or changes password.
 * Body: { name?, currentPassword?, newPassword? }
 */
export async function PATCH(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, currentPassword, newPassword } = body || {};

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);

    const user = await User.findById(userObjectId).select("+password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    // 1. Update name
    if (name !== undefined) {
      const trimmedName = (name || "").trim();
      if (!trimmedName) {
        return NextResponse.json(
          { success: false, message: "Name cannot be empty." },
          { status: 400 }
        );
      }
      if (trimmedName.length > 60) {
        return NextResponse.json(
          { success: false, message: "Name cannot exceed 60 characters." },
          { status: 400 }
        );
      }
      user.name = trimmedName;
    }

    // 2. Change password if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: "Current password is required to set a new password." },
          { status: 400 }
        );
      }

      const isValidPassword = await comparePassword(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect." },
          { status: 400 }
        );
      }

      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters." },
          { status: 400 }
        );
      }

      user.password = await hashPassword(newPassword);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/user/profile]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile." },
      { status: 500 }
    );
  }
}

