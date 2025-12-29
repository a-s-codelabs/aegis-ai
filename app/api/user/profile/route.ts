import { NextResponse } from "next/server"
import { users } from "../../shared/users"

// GET user profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    let user = users.find((u) => u.id === userId)

    // If user doesn't exist (e.g., after server restart), return basic structure
    // The PUT endpoint will create the user when they update their profile
    if (!user) {
      return NextResponse.json({
        success: true,
        profile: {
          id: userId,
          name: "",
          phoneNumber: "",
          profilePicture: null,
        },
      })
    }

    // Return user profile without password
    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
      },
    })
  } catch (error) {
    console.error("[Profile API] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// UPDATE user profile
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { userId, name, phoneNumber, profilePicture } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    let userIndex = users.findIndex((u) => u.id === userId)

    // If user doesn't exist (e.g., after server restart), create them
    if (userIndex === -1) {
      // Check if we have required fields to create a new user
      if (!name || !phoneNumber) {
        return NextResponse.json(
          { error: "Name and phone number are required to create a new user" },
          { status: 400 }
        )
      }

      // Normalize phone number
      const normalizedPhone = phoneNumber.replace(/[^\d+]/g, "")
      const finalPhone = normalizedPhone.startsWith("+")
        ? normalizedPhone
        : `+1${normalizedPhone}`

      // Create new user entry
      const newUser = {
        id: userId,
        phoneNumber: finalPhone,
        password: "default123", // Default password for demo - user should reset via login
        name: name.trim(),
        profilePicture: profilePicture || null,
      }

      users.push(newUser)
      userIndex = users.length - 1

      console.log(`[Profile API] Created new user entry for userId: ${userId}`)
    } else {
      // Update existing user fields if provided
      if (name !== undefined) {
        users[userIndex].name = name.trim()
      }

      if (phoneNumber !== undefined) {
        // Normalize phone number
        const normalizedPhone = phoneNumber.replace(/[^\d+]/g, "")
        users[userIndex].phoneNumber = normalizedPhone.startsWith("+")
          ? normalizedPhone
          : `+1${normalizedPhone}`
      }

      if (profilePicture !== undefined) {
        users[userIndex].profilePicture = profilePicture
      }
    }

    // Return updated profile without password
    return NextResponse.json({
      success: true,
      profile: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        phoneNumber: users[userIndex].phoneNumber,
        profilePicture: users[userIndex].profilePicture,
      },
    })
  } catch (error) {
    console.error("[Profile API] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

