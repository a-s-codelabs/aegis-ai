import { NextResponse } from "next/server"
import { users } from "../shared/users"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phoneNumber, password, name } = body

    if (!phoneNumber || !password || !name) {
      return NextResponse.json(
        { error: "Phone number, password, and name are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Normalize phone number for comparison
    const normalizedPhone = phoneNumber.replace(/[^\d+]/g, "")

    // Check if user already exists
    const existingUser = users.find((u) => {
      const userPhoneNormalized = u.phoneNumber.replace(/[^\d+]/g, "")
      return userPhoneNormalized === normalizedPhone
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this phone number already exists" },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      phoneNumber: normalizedPhone.startsWith("+")
        ? normalizedPhone
        : `+1${normalizedPhone}`,
      password: password, // In production, hash this with bcrypt
      name: name.trim(),
      profilePicture: null as string | null,
    }

    users.push(newUser)

    // Note: New users will have an empty contact list by default
    // The contacts API will return an empty array for users without contacts

    // Generate a simple token (in production, use JWT or similar)
    const token = Buffer.from(`${newUser.id}:${Date.now()}`).toString("base64")

    return NextResponse.json({
      success: true,
      userId: newUser.id,
      phoneNumber: newUser.phoneNumber,
      name: newUser.name,
      profilePicture: newUser.profilePicture,
      token,
    })
  } catch (error) {
    console.error("[Register API] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

