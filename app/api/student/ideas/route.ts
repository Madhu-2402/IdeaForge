import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ProjectIdea from "@/models/ProjectIdea"
import { getCurrentUser, requireRole } from "@/lib/auth"

export async function GET(req: NextRequest) {
  // Check if user is a student
  const authError = await requireRole(req, "student")
  if (authError) return authError

  try {
    await connectToDatabase()

    // Get current user - passing the request object
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all ideas submitted by the student
    const ideas = await ProjectIdea.find({ studentId: user._id }).sort({ submittedAt: -1 })

    return NextResponse.json({ ideas })
  } catch (error) {
    console.error("Error fetching ideas:", error)
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 })
  }
}