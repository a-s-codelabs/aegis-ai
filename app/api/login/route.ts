import { NextResponse } from "next/server"
import { users } from "../shared/users"

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

    // Normalize phone number for comparison
    const normalizedPhone = phoneNumber.replace(/[^\d+]/g, "")

    // Find user by phone number
    const user = users.find((u) => {
      const userPhoneNormalized = u.phoneNumber.replace(/[^\d+]/g, "")
      return userPhoneNormalized === normalizedPhone
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      )
    }

    // Check password (in production, use bcrypt or similar)
    if (user.password !== password) {
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

