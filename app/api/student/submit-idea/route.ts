import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ProjectIdea from "@/models/ProjectIdea"
import { checkIdeaUniqueness } from "@/lib/ai-service"
import { getCurrentUser, requireRole } from "@/lib/auth"

export async function POST(req: NextRequest) {
  // Check if user is a student
  const authError = await requireRole(req, "student")
  if (authError) return authError

  try {
    const { title, description, areasOfInterest, domainInterest, languagesKnown, additionalInfo } = await req.json()

    // Check if the idea is unique
    const { isUnique, similarityScore } = await checkIdeaUniqueness(title, description)

    // If similarity is too high, reject the submission
    if (!isUnique) {
      return NextResponse.json(
        { error: "This idea is too similar to existing submissions. Please try a different approach." },
        { status: 400 },
      )
    }

    await connectToDatabase()

    // Get current user - pass the request object
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create new project idea
    const projectIdea = new ProjectIdea({
      title,
      description,
      studentId: user._id,
      areasOfInterest: areasOfInterest.split(",").map((item: string) => item.trim()),
      domainInterest,
      languagesKnown: languagesKnown.split(",").map((item: string) => item.trim()),
      additionalInfo,
      isUnique: true,
      uniquenessScore: 100 - similarityScore, // Convert similarity to uniqueness
      submittedAt: new Date(),
    })

    await projectIdea.save()

    return NextResponse.json({
      success: true,
      message: "Project idea submitted successfully",
      idea: projectIdea,
    })
  } catch (error) {
    console.error("Error submitting idea:", error)
    return NextResponse.json({ error: "Failed to submit idea" }, { status: 500 })
  }
}