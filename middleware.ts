import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

// Secure secret (must be strong and preferably from .env file)
const JWT_SECRET =
  process.env.JWT_SECRET || "ad989da5e56528c46ceb00a81378a9f5fd90defd1a4fda7ab39dd1ca1d93ba02";

// Verify JWT token using jose
async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Publicly accessible routes
  const isPublicPath =
    path === "/" ||
    path === "/student/login" ||
    path === "/student/register" ||
    path === "/staff/login" ||
    path === "/staff/register";

  const token = request.cookies.get("token")?.value || "";

  console.log("Middleware triggered for path:", path);
  console.log("Token found:", token);

  // Handle redirection if user is already authenticated and visits public routes
  if (isPublicPath) {
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded && decoded.role) {
        if (decoded.role === "student") {
          return NextResponse.redirect(new URL("/student/dashboard", request.url));
        } else if (decoded.role === "staff") {
          return NextResponse.redirect(new URL("/staff/dashboard", request.url));
        }
      }
    }
    return NextResponse.next(); // Let public users proceed
  }

  // Protect private routes (student or staff dashboards)
  if (!token) {
    if (path.startsWith("/student")) {
      return NextResponse.redirect(new URL("/student/login", request.url));
    } else if (path.startsWith("/staff")) {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const decoded = await verifyToken(token);
  if (!decoded || !decoded.role) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Role-based access control
  if (path.startsWith("/student") && decoded.role !== "student") {
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  if (path.startsWith("/staff") && decoded.role !== "staff") {
    return NextResponse.redirect(new URL("/staff/dashboard", request.url));
  }

  return NextResponse.next(); // Authenticated and authorized
}

// Paths where this middleware should run
export const config = {
  matcher: ["/", "/student/:path*", "/staff/:path*"],
};
