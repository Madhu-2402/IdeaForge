import { type NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import ProjectIdea from "@/models/ProjectIdea";
import { checkIdeaUniqueness } from "@/lib/ai-service";
import { requireRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  // Check if user is a staff
  const authError = await requireRole(req, "staff");
  if (authError) return authError;

  try {
    const { ideaId } = await req.json();

    await connectToDatabase();

    // Get the idea
    const idea = await ProjectIdea.findById(ideaId);
    if (!idea) {
      return NextResponse.json({ error: "Project idea not found" }, { status: 404 });
    }

    //  Destructure result from checkIdeaUniqueness
    const { similarityScore, isUnique } = await checkIdeaUniqueness(idea.title, idea.description);

    // Update the idea with the uniqueness score
    idea.uniquenessScore = 100 - similarityScore;
    await idea.save();

    return NextResponse.json({
      success: true,
      similarityScore,
      uniquenessScore: 100 - similarityScore,
      isUnique,
    });
  } catch (error) {
    console.error("Error checking similarity:", error);
    return NextResponse.json({ error: "Failed to check similarity" }, { status: 500 });
  }
}
