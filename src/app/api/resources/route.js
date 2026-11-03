import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth/jwt";
import connectDB from "@/lib/db/mongodb";
import { LearningResource, Subject, Note } from "@/models";

/**
 * GET /api/resources
 * Retrieves all learning resources for the authenticated user.
 * Optional query: ?subjectId=xxx or ?noteId=xxx
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
    const noteIdParam = searchParams.get("noteId");

    const query = { userId: userObjectId };
    if (subjectIdParam && mongoose.Types.ObjectId.isValid(subjectIdParam)) {
      query.subjectId = new mongoose.Types.ObjectId(subjectIdParam);
    }
    if (noteIdParam && mongoose.Types.ObjectId.isValid(noteIdParam)) {
      query.noteId = new mongoose.Types.ObjectId(noteIdParam);
    }

    const resources = await LearningResource.find(query)
      .sort({ createdAt: -1 })
      .lean();

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

    const formatted = resources.map((r) => ({
      _id: r._id.toString(),
      title: r.title,
      description: r.description || "",
      url: r.url,
      platform: r.platform,
      resourceType: r.resourceType,
      subject: r.subjectId ? subjectMap[r.subjectId.toString()] || null : null,
      noteId: r.noteId ? r.noteId.toString() : null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return NextResponse.json({ success: true, resources: formatted });
  } catch (error) {
    console.error("[GET /api/resources]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch resources." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resources
 * Creates a new learning resource.
 * Body: { title, url, description?, platform?, resourceType?, subjectId?, noteId? }
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
    const { title, url, description, platform, resourceType, subjectId, noteId } = body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Resource title is required." },
        { status: 400 }
      );
    }

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { success: false, message: "Resource URL is required." },
        { status: 400 }
      );
    }

    let detectedPlatform = platform || "Other";
    let detectedType = resourceType || "link";

    // Auto-detect YouTube URLs
    const trimmedUrl = url.trim();
    if (trimmedUrl.includes("youtube.com") || trimmedUrl.includes("youtu.be")) {
      detectedPlatform = "YouTube";
      if (trimmedUrl.includes("list=")) {
        detectedType = "playlist";
      } else {
        detectedType = "video";
      }
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(session.userId);

    const resourceData = {
      userId: userObjectId,
      title: title.trim(),
      description: (description || "").trim(),
      url: trimmedUrl,
      platform: detectedPlatform,
      resourceType: detectedType,
    };

    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      resourceData.subjectId = new mongoose.Types.ObjectId(subjectId);
    }
    if (noteId && mongoose.Types.ObjectId.isValid(noteId)) {
      resourceData.noteId = new mongoose.Types.ObjectId(noteId);
    }

    const created = await LearningResource.create(resourceData);

    return NextResponse.json(
      {
        success: true,
        message: "Resource created successfully.",
        resource: {
          _id: created._id.toString(),
          title: created.title,
          description: created.description,
          url: created.url,
          platform: created.platform,
          resourceType: created.resourceType,
          subjectId: created.subjectId ? created.subjectId.toString() : null,
          noteId: created.noteId ? created.noteId.toString() : null,
          createdAt: created.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/resources]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create resource." },
      { status: 500 }
    );
  }
}

