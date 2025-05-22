import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import User from "@/models/User"
import { signToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, department } = await req.json()

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      department,
    })

    await user.save()

    // Generate JWT token
    const token = await signToken(user)

    // Set cookie
    const response = NextResponse.json(
      { success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
      { status: 201 },
    )

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 1 day
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
