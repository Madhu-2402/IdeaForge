import { type NextRequest, NextResponse } from "next/server"
import { generateProjectIdea } from "@/lib/ai-service"
import { requireRole } from "@/lib/auth"

export async function POST(req: NextRequest) {
  // Check if user is a student
  const authError = await requireRole(req, "student")
  if (authError) return authError

  try {
    const { areasOfInterest, domainInterest, languagesKnown, additionalInfo } = await req.json()

    // Validate required fields
    if (!areasOfInterest || !domainInterest || !languagesKnown) {
      return NextResponse.json(
        { error: "Areas of interest, domain interest, and programming languages are required" },
        { status: 400 },
      )
    }

    // Generate idea using Gemini
    const idea = await generateProjectIdea({
      areasOfInterest,
      domainInterest,
      languagesKnown,
      additionalInfo,
    })

    return NextResponse.json({ idea })
  } catch (error) {
    console.error("Error generating idea:", error)
    return NextResponse.json({ error: "Failed to generate idea. Please try again later." }, { status: 500 })
  }
}
