import { NextResponse } from "next/server"
import { findUserByPhone } from "../shared/users"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phoneNumber, password } = body

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: "Phone number and password are required" },
        { status: 400 }
      )
    }

    // Find user by phone number (normalization handled in findUserByPhone)
    const user = await findUserByPhone(phoneNumber)

    if (!user) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      )
    }

    // Check password (in production, use bcrypt or similar)
    if (user.password !== password.trim()) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      )
    }

    // Generate a simple token (in production, use JWT or similar)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64")

    return NextResponse.json({
      success: true,
      userId: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      profilePicture: user.profilePicture || null,
      token,
    })
  } catch (error) {
    console.error("[Login API] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

