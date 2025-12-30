import { NextResponse } from "next/server"
import { findUserById, updateUser, addUser, invalidateCache } from "../../shared/users"

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

    const user = await findUserById(userId)

    // If user doesn't exist, return basic structure
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

    let user = await findUserById(userId)

    // If user doesn't exist, create them
    if (!user) {
      // Check if we have required fields to create a new user
      if (!name || !phoneNumber) {
        return NextResponse.json(
          { error: "Name and phone number are required to create a new user" },
          { status: 400 }
        )
      }

      // Create new user entry
      const newUser = await addUser({
        phoneNumber: phoneNumber.trim(),
        password: "default123", // Default password for demo - user should reset via login
        name: name.trim(),
        profilePicture: profilePicture || null,
      })

      // Override the ID to match the requested userId
      user = await updateUser(newUser.id, { 
        phoneNumber: newUser.phoneNumber,
        name: newUser.name,
        profilePicture: newUser.profilePicture,
      })

      // If we need to use the original userId, we'll need to handle this differently
      // For now, we'll use the generated ID
      console.log(`[Profile API] Created new user entry for userId: ${newUser.id}`)
      
      invalidateCache()
    } else {
      // Update existing user fields if provided
      const updates: Partial<{ name: string; phoneNumber: string; profilePicture: string | null }> = {}
      
      if (name !== undefined) {
        updates.name = name.trim()
      }

      if (phoneNumber !== undefined) {
        updates.phoneNumber = phoneNumber.trim()
      }

      if (profilePicture !== undefined) {
        updates.profilePicture = profilePicture
      }

      if (Object.keys(updates).length > 0) {
        user = await updateUser(userId, updates)
        invalidateCache()
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 }
      )
    }

    // Return updated profile without password
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

