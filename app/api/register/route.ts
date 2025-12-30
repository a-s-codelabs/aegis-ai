import { NextResponse } from "next/server"
import { findUserByPhone, addUser, invalidateCache } from "../shared/users"

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

    // Check if user already exists (normalization handled in findUserByPhone)
    const existingUser = await findUserByPhone(phoneNumber)

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this phone number already exists" },
        { status: 409 }
      )
    }

    // Create new user (normalization and ID generation handled in addUser)
    const newUser = await addUser({
      phoneNumber: phoneNumber.trim(),
      password: password.trim(), // In production, hash this with bcrypt
      name: name.trim(),
      profilePicture: null,
    })

    // Invalidate cache after adding user
    invalidateCache()

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

