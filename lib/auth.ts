import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import { type IUser } from "@/models/User"; // Import only the type, not the model directly

// Ensure JWT_SECRET is set in your environment variables
const JWT_SECRET = process.env.JWT_SECRET || "ad989da5e56528c46ceb00a81378a9f5fd90defd1a4fda7ab39dd1ca1d93ba02";

export async function signToken(user: IUser) {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
}

// This function should only be used in API routes or Server Components
export async function getCurrentUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded) return null;

  try {
    // Lazy-load Mongoose and User model
    const mongoose = await import("mongoose");
    const { default: User } = await import("@/models/User");

    const user = await User.findById(decoded.id).select("-password");
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

export async function requireAuth(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  return null; // Auth successful
}

export async function requireRole(req: NextRequest, role: string) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const token = req.cookies.get("token")?.value;
  const decoded = await verifyToken(token!);

  if (!decoded || decoded.role !== role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null; // Role check passed
}