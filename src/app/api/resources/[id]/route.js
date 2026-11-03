import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { LearningResource } from "@/models";

/**
 * PATCH /api/resources/[id]
 * Updates a resource.
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
        { success: false, message: "Invalid resource ID." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, url, description, platform, resourceType, subjectId } = body || {};

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const resourceObjectId = new mongoose.Types.ObjectId(id);

    const resource = await LearningResource.findOne({
      _id: resourceObjectId,
      userId: userObjectId,
    });

    if (!resource) {
      return NextResponse.json(
        { success: false, message: "Resource not found." },
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
      resource.title = trimmed;
    }

    if (url !== undefined) {
      const trimmedUrl = (url || "").trim();
      if (!trimmedUrl) {
        return NextResponse.json(
          { success: false, message: "URL cannot be empty." },
          { status: 400 }
        );
      }
      resource.url = trimmedUrl;
    }

    if (description !== undefined) {
      resource.description = (description || "").trim();
    }

    if (platform !== undefined) {
      resource.platform = platform;
    }

    if (resourceType !== undefined) {
      resource.resourceType = resourceType;
    }

    if (subjectId !== undefined) {
      resource.subjectId = subjectId && mongoose.Types.ObjectId.isValid(subjectId)
        ? new mongoose.Types.ObjectId(subjectId)
        : null;
    }

    await resource.save();

    return NextResponse.json({
      success: true,
      message: "Resource updated successfully.",
      resource: {
        _id: resource._id.toString(),
        title: resource.title,
        url: resource.url,
        description: resource.description,
        platform: resource.platform,
        resourceType: resource.resourceType,
        subjectId: resource.subjectId ? resource.subjectId.toString() : null,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/resources/[id]]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update resource." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resources/[id]
 * Deletes a resource.
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
        { success: false, message: "Invalid resource ID." },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);
    const resourceObjectId = new mongoose.Types.ObjectId(id);

    const deleted = await LearningResource.findOneAndDelete({
      _id: resourceObjectId,
      userId: userObjectId,
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Resource not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully.",
    });
  } catch (error) {
    console.error("[DELETE /api/resources/[id]]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete resource." },
      { status: 500 }
    );
  }
}

