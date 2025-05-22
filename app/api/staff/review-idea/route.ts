import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ProjectIdea from "@/models/ProjectIdea";
import Feedback from "@/models/Feedback";
import { getCurrentUser, requireRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  // Check if user is a staff
  const authError = await requireRole(req, "staff");
  if (authError) return authError;

  try {
    const { ideaId, status, feedback } = await req.json();

    // Validate input data
    if (!ideaId) {
      return NextResponse.json({ error: "Idea ID is required" }, { status: 400 });
    }

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Get current user - pass the request object
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the idea first to make sure it exists
    const idea = await ProjectIdea.findById(ideaId);
    if (!idea) {
      return NextResponse.json({ error: "Project idea not found" }, { status: 404 });
    }

    // Update project idea
    const updatedIdea = await ProjectIdea.findByIdAndUpdate(
      ideaId,
      {
        status,
        feedback,
        reviewedAt: new Date(),
        reviewedBy: user._id,
      },
      { new: true }
    );

    // Create feedback record
    if (feedback) {
      const feedbackRecord = new Feedback({
        ideaId,
        staffId: user._id,
        content: feedback,
      });
      await feedbackRecord.save();
    }

    return NextResponse.json({
      success: true,
      message: `Project idea has been ${status}`,
      idea: updatedIdea,
    });
  } catch (error) {
    console.error("Error reviewing idea:", error);
    return NextResponse.json({ error: "Failed to review idea" }, { status: 500 });
  }
}