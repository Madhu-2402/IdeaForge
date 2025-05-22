import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import ProjectIdea from "@/models/ProjectIdea"
import User from "@/models/User"
import { requireRole } from "@/lib/auth"

export async function GET(req: NextRequest) {
  // Check if user is a staff
  const authError = await requireRole(req, "staff")
  if (authError) return authError

  try {
    await connectToDatabase()

    // Get status filter from query params
    const url = new URL(req.url)
    const status = url.searchParams.get("status")

    // Build query
    const query: any = {}
    if (status) {
      query.status = status
    }

    // Get ideas with student details
    const ideas = await ProjectIdea.find(query).sort({ submittedAt: -1 })

    // Populate student details
    const ideasWithStudents = await Promise.all(
      ideas.map(async (idea) => {
        const student = await User.findById(idea.studentId).select("name email")
        return {
          ...idea.toObject(),
          student: student ? { name: student.name, email: student.email } : null,
        }
      }),
    )

    return NextResponse.json({ ideas: ideasWithStudents })
  } catch (error) {
    console.error("Error fetching ideas:", error)
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 })
  }
}
