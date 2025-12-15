import { NextResponse } from "next/server"

// Mock contact database - In production, this would be a real database
// Each user has their own contact list
const userContacts: Record<string, Array<{ id: string; name: string; phoneNumber: string }>> = {
  "1": [
    { id: "1", name: "Alice Johnson", phoneNumber: "+15551111111" },
    { id: "2", name: "Bob Williams", phoneNumber: "+15552222222" },
    { id: "3", name: "Charlie Brown", phoneNumber: "+15553333333" },
  ],
  "2": [
    { id: "4", name: "David Lee", phoneNumber: "+15554444444" },
    { id: "5", name: "Emma Davis", phoneNumber: "+15555555555" },
  ],
}

export async function GET(request: Request) {
  try {
    // Get userId from Authorization header or query params
    const authHeader = request.headers.get("authorization")
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") ||
      (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null)

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      )
    }

    // Get contacts for this user
    const contacts = userContacts[userId] || []

    return NextResponse.json({
      success: true,
      contacts,
    })
  } catch (error) {
    console.error("[Contacts API] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, contacts } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Update contacts for this user (in production, save to database)
    if (!userContacts[userId]) {
      userContacts[userId] = []
    }
    userContacts[userId] = contacts

    return NextResponse.json({
      success: true,
      message: "Contacts saved successfully",
    })
  } catch (error) {
    console.error("[Contacts API] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

